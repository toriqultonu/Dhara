"""Cohere Reranker provider."""

import cohere
from app.providers.base import RerankResult
from app.config import settings


class CohereRerankerProvider:
    def __init__(self, api_key: str | None = None, model: str | None = None):
        self._client = cohere.AsyncClientV2(api_key=api_key or settings.cohere_api_key)
        self._model = model or settings.cohere_rerank_model

    @property
    def provider_name(self) -> str:
        return "cohere"

    async def rerank(self, query: str, documents: list[str], top_k: int = 5) -> list[RerankResult]:
        response = await self._client.rerank(
            query=query, documents=documents, top_n=top_k, model=self._model,
        )
        return [
            RerankResult(index=r.index, score=r.relevance_score, text=documents[r.index])
            for r in response.results
        ]
