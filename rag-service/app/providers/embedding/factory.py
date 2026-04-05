"""Factory for creating embedding providers from configuration."""

from app.providers.base import EmbeddingProvider
from app.config import settings


def create_embedding_provider(provider_name: str | None = None) -> EmbeddingProvider:
    name = (provider_name or settings.embedding_provider).lower()

    if name == "bgem3":
        from app.providers.embedding.bgem3_provider import BGEM3EmbeddingProvider
        return BGEM3EmbeddingProvider()
    elif name == "ollama":
        from app.providers.embedding.ollama_provider import OllamaEmbeddingProvider
        return OllamaEmbeddingProvider()
    elif name == "openai":
        from app.providers.embedding.openai_provider import OpenAIEmbeddingProvider
        return OpenAIEmbeddingProvider()
    else:
        available = ["bgem3", "ollama", "openai"]
        raise ValueError(f"Unknown embedding provider: '{name}'. Available: {available}")
