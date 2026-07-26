"""Tests for the RAG pipeline: retrieve -> rerank -> generate -> cite."""

from unittest.mock import AsyncMock

import pytest

from app.models.search import SearchResult
from app.providers.base import LLMResponse, RerankResult
from app.services.rag_pipeline import RAGPipeline


def make_raw_results() -> list[SearchResult]:
    return [
        SearchResult(
            source_type="statute", source_id=100, title="Penal Code 1860",
            snippet="Section 302: punishment for murder", score=0.9,
        ),
        SearchResult(
            source_type="judgment", source_id=200, title="State v Rahim",
            snippet="Appeal against murder conviction", score=0.8,
        ),
        SearchResult(
            source_type="sro", source_id=300, title="SRO No. 45",
            snippet="Gazette notification on court fees", score=0.7,
        ),
    ]


def make_llm_response(text: str) -> LLMResponse:
    return LLMResponse(
        text=text, model="mock-1.0", provider="mock",
        input_tokens=100, output_tokens=50, cost_usd=0.0,
    )


@pytest.fixture
def mock_search_service() -> AsyncMock:
    search = AsyncMock()
    search.hybrid_search.return_value = make_raw_results()
    return search


@pytest.fixture
def mock_router() -> AsyncMock:
    router = AsyncMock()
    router.generate.return_value = make_llm_response(
        "Mock answer citing [Source 1] and [Source 2]."
    )
    return router


@pytest.fixture
def pipeline(mock_embedder, mock_reranker, mock_router, mock_search_service) -> RAGPipeline:
    return RAGPipeline(
        embedding_provider=mock_embedder,
        reranker_provider=mock_reranker,
        llm_router=mock_router,
        search_service=mock_search_service,
    )


class TestRAGPipelineAsk:
    async def test_search_called_with_question(
        self, pipeline: RAGPipeline, mock_search_service: AsyncMock
    ) -> None:
        await pipeline.ask("ধারা ৩০২ কি?", top_k=5)
        mock_search_service.hybrid_search.assert_awaited_once()
        kwargs = mock_search_service.hybrid_search.await_args.kwargs
        assert kwargs["query_text"] == "ধারা ৩০২ কি?"
        assert kwargs["top_k"] == 20  # over-fetch: top_k * 4

    async def test_reranker_receives_raw_snippets(
        self, mock_embedder, mock_router, mock_search_service
    ) -> None:
        reranker = AsyncMock()
        reranker.rerank.return_value = [
            RerankResult(index=i, score=1.0 - i * 0.1, text=r.snippet)
            for i, r in enumerate(make_raw_results())
        ]
        pipeline = RAGPipeline(mock_embedder, reranker, mock_router, mock_search_service)

        await pipeline.ask("What is section 302?", top_k=5)

        reranker.rerank.assert_awaited_once()
        kwargs = reranker.rerank.await_args.kwargs
        assert kwargs["query"] == "What is section 302?"
        assert kwargs["documents"] == [r.snippet for r in make_raw_results()]

    async def test_answer_and_token_accounting(
        self, pipeline: RAGPipeline, mock_router: AsyncMock
    ) -> None:
        response = await pipeline.ask("What is section 302?")
        assert response.answer == "Mock answer citing [Source 1] and [Source 2]."
        assert response.llm_provider == "mock"
        assert response.llm_model == "mock-1.0"
        assert response.tokens_used == 150  # input + output
        mock_router.generate.assert_awaited_once()

    async def test_citations_follow_context_order(
        self, pipeline: RAGPipeline
    ) -> None:
        # Identity reranker (conftest mock): [Source 1] -> raw_results[0], etc.
        response = await pipeline.ask("What is section 302?")
        assert [c.source_id for c in response.citations] == [100, 200]

    async def test_citations_map_correctly_after_reranker_reordering(
        self, mock_embedder, mock_router, mock_search_service
    ) -> None:
        """Regression: [Source N] must resolve through RerankResult.index.

        The reranker promotes raw_results[2] to first place, so the answer's
        [Source 1] must cite raw_results[2] — not raw_results[0].
        """
        raw = make_raw_results()
        reranker = AsyncMock()
        reranker.rerank.return_value = [
            RerankResult(index=2, score=0.99, text=raw[2].snippet),
            RerankResult(index=0, score=0.55, text=raw[0].snippet),
        ]
        pipeline = RAGPipeline(mock_embedder, reranker, mock_router, mock_search_service)

        response = await pipeline.ask("court fees?")

        assert len(response.citations) == 2
        # [Source 1] -> reranked first -> original index 2 (the SRO)
        assert response.citations[0].source_type == "sro"
        assert response.citations[0].source_id == 300
        assert response.citations[0].title == "SRO No. 45"
        # [Source 2] -> reranked second -> original index 0 (the statute)
        assert response.citations[1].source_type == "statute"
        assert response.citations[1].source_id == 100

    async def test_context_matches_reranked_order(
        self, mock_embedder, mock_router, mock_search_service
    ) -> None:
        raw = make_raw_results()
        reranker = AsyncMock()
        reranker.rerank.return_value = [
            RerankResult(index=1, score=0.9, text=raw[1].snippet),
            RerankResult(index=2, score=0.8, text=raw[2].snippet),
        ]
        pipeline = RAGPipeline(mock_embedder, reranker, mock_router, mock_search_service)

        await pipeline.ask("appeal?")

        prompt = mock_router.generate.await_args.kwargs["prompt"]
        assert f"[Source 1] {raw[1].snippet}" in prompt
        assert f"[Source 2] {raw[2].snippet}" in prompt

    async def test_fallback_citations_when_no_markers(
        self, pipeline: RAGPipeline, mock_router: AsyncMock
    ) -> None:
        mock_router.generate.return_value = make_llm_response("An answer with no markers.")
        response = await pipeline.ask("What is section 302?")
        assert [c.source_id for c in response.citations] == [100, 200, 300]

    async def test_no_search_results(
        self, pipeline: RAGPipeline, mock_search_service: AsyncMock, mock_reranker
    ) -> None:
        mock_search_service.hybrid_search.return_value = []
        response = await pipeline.ask("obscure question")
        assert response.citations == []
        assert response.answer  # LLM still answers


class TestAskWithDocumentContext:
    async def test_no_search_and_no_citations(
        self, pipeline: RAGPipeline, mock_search_service: AsyncMock, mock_router: AsyncMock
    ) -> None:
        response = await pipeline.ask_with_document_context(
            question="Summarize this contract", document_text="This agreement is made...",
        )
        mock_search_service.hybrid_search.assert_not_awaited()
        assert response.citations == []
        assert response.answer == mock_router.generate.return_value.text

    async def test_document_truncated_to_8000_chars(
        self, pipeline: RAGPipeline, mock_router: AsyncMock
    ) -> None:
        await pipeline.ask_with_document_context(
            question="Summarize", document_text="x" * 20000,
        )
        prompt = mock_router.generate.await_args.kwargs["prompt"]
        assert "x" * 8000 in prompt
        assert "x" * 8001 not in prompt
