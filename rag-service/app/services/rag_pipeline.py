"""Full RAG pipeline: Query -> Embed -> Search -> Rerank -> Generate -> Cite"""

import logging
import re
from app.providers.base import EmbeddingProvider, RerankerProvider, RerankResult
from app.services.llm_router import LLMRouter
from app.services.search_service import SearchService
from app.models.search import SearchResult
from app.models.ask import RAGResponse, Citation
from app.prompts.legal_qa import DHARA_SYSTEM_PROMPT, build_legal_qa_prompt

logger = logging.getLogger(__name__)


class RAGPipeline:
    def __init__(
        self, embedding_provider: EmbeddingProvider,
        reranker_provider: RerankerProvider,
        llm_router: LLMRouter, search_service: SearchService,
    ):
        self._embedder = embedding_provider
        self._reranker = reranker_provider
        self._llm_router = llm_router
        self._search = search_service

    async def ask_with_document_context(
        self, question: str, document_text: str,
        language: str = "bn", user_tier: str = "FREE",
    ) -> RAGResponse:
        """Chat against a user-uploaded document — no vector search, text injected directly."""
        context = document_text[:8000] if len(document_text) > 8000 else document_text
        complexity = self._classify_complexity(question, context)
        prompt = build_legal_qa_prompt(question, context, language)

        llm_response = await self._llm_router.generate(
            prompt=prompt, system_prompt=DHARA_SYSTEM_PROMPT,
            complexity=complexity, user_tier=user_tier,
        )
        return RAGResponse(
            answer=llm_response.text, citations=[],
            llm_provider=llm_response.provider, llm_model=llm_response.model,
            tokens_used=llm_response.input_tokens + llm_response.output_tokens,
            cost_usd=llm_response.cost_usd,
        )

    async def ask(
        self, question: str, language: str = "bn",
        user_tier: str = "FREE", top_k: int = 5,
        statute_id: int | None = None,
    ) -> RAGResponse:
        raw_results = await self._search.hybrid_search(
            query_text=question, language=language, top_k=top_k * 4,
            statute_id=statute_id,
        )

        if raw_results:
            reranked = await self._reranker.rerank(
                query=question, documents=[r.snippet for r in raw_results], top_k=top_k,
            )
        else:
            reranked = []

        context = self._build_context(raw_results, reranked)
        complexity = self._classify_complexity(question, context)
        prompt = build_legal_qa_prompt(question, context, language)

        llm_response = await self._llm_router.generate(
            prompt=prompt, system_prompt=DHARA_SYSTEM_PROMPT,
            complexity=complexity, user_tier=user_tier,
        )

        citations = self._extract_citations(llm_response.text, raw_results, reranked)

        return RAGResponse(
            answer=llm_response.text, citations=citations,
            llm_provider=llm_response.provider, llm_model=llm_response.model,
            tokens_used=llm_response.input_tokens + llm_response.output_tokens,
            cost_usd=llm_response.cost_usd,
        )

    def _build_context(self, raw_results: list[SearchResult], reranked: list[RerankResult]) -> str:
        snippets = [r.text for r in reranked] if reranked else [r.snippet for r in raw_results[:5]]
        return "\n\n".join(f"[Source {i}] {s}" for i, s in enumerate(snippets, 1))

    def _classify_complexity(self, question: str, context: str) -> float:
        score = 0.3
        q = question.lower()
        if any(w in q for w in ["compare", "difference", "versus", "তুলনা"]):
            score += 0.3
        if any(w in q for w in ["explain", "analyze", "ব্যাখ্যা", "বিশ্লেষণ"]):
            score += 0.2
        if len(question) > 200:
            score += 0.1
        if len(context) > 2000:
            score += 0.1
        return min(score, 1.0)

    def _extract_citations(
        self, answer: str, raw_results: list[SearchResult], reranked: list[RerankResult],
    ) -> list[Citation]:
        citations = []
        for idx_str in re.findall(r"\[Source\s+(\d+)\]", answer):
            idx = int(idx_str) - 1
            if 0 <= idx < len(raw_results):
                r = raw_results[idx]
                citations.append(Citation(
                    source_type=r.source_type, source_id=r.source_id,
                    title=r.title, snippet=r.snippet[:200],
                ))

        if not citations and raw_results:
            for r in raw_results[:3]:
                citations.append(Citation(
                    source_type=r.source_type, source_id=r.source_id,
                    title=r.title, snippet=r.snippet[:200],
                ))
        return citations
