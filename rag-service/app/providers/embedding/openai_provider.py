"""OpenAI embedding provider."""

from openai import AsyncOpenAI
from app.providers.base import EmbeddingResult
from app.config import settings


class OpenAIEmbeddingProvider:
    def __init__(self, api_key: str | None = None, model: str | None = None):
        self._model = model or settings.openai_embedding_model
        self._client = AsyncOpenAI(api_key=api_key or settings.openai_api_key)

    @property
    def provider_name(self) -> str:
        return "openai"

    @property
    def model_name(self) -> str:
        return self._model

    @property
    def dimension(self) -> int:
        return settings.embedding_dimension

    async def embed_texts(self, texts: list[str], batch_size: int = 32) -> list[EmbeddingResult]:
        results = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            response = await self._client.embeddings.create(model=self._model, input=batch)
            for item in response.data:
                results.append(EmbeddingResult(
                    dense_embedding=item.embedding, model=self._model, provider="openai",
                ))
        return results

    async def embed_query(self, query: str) -> EmbeddingResult:
        results = await self.embed_texts([query])
        return results[0]
