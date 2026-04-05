"""Factory for creating reranker providers."""

from app.providers.base import RerankerProvider
from app.config import settings


def create_reranker_provider(provider_name: str | None = None) -> RerankerProvider:
    name = (provider_name or settings.reranker_provider).lower()

    if name == "bge":
        from app.providers.reranker.bge_reranker import BGERerankerProvider
        return BGERerankerProvider()
    elif name == "cohere":
        from app.providers.reranker.cohere_reranker import CohereRerankerProvider
        return CohereRerankerProvider()
    elif name == "noop":
        from app.providers.reranker.noop_reranker import NoopRerankerProvider
        return NoopRerankerProvider()
    else:
        available = ["bge", "cohere", "noop"]
        raise ValueError(f"Unknown reranker provider: '{name}'. Available: {available}")
