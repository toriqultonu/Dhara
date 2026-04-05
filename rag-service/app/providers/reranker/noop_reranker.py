"""No-op reranker — passthrough for testing/budget mode."""

from app.providers.base import RerankResult


class NoopRerankerProvider:
    @property
    def provider_name(self) -> str:
        return "noop"

    async def rerank(self, query: str, documents: list[str], top_k: int = 5) -> list[RerankResult]:
        return [
            RerankResult(index=i, score=1.0 - (i * 0.1), text=doc)
            for i, doc in enumerate(documents[:top_k])
        ]
