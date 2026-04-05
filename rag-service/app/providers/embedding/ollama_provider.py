"""Ollama embedding provider."""

import httpx
from app.providers.base import EmbeddingResult
from app.config import settings


class OllamaEmbeddingProvider:
    def __init__(self, base_url: str | None = None, model: str | None = None):
        self._base_url = base_url or settings.ollama_base_url
        self._model = model or settings.ollama_embedding_model
        self._client = httpx.AsyncClient(base_url=self._base_url, timeout=120.0)

    @property
    def provider_name(self) -> str:
        return "ollama"

    @property
    def model_name(self) -> str:
        return self._model

    @property
    def dimension(self) -> int:
        return settings.embedding_dimension

    async def embed_texts(self, texts: list[str], batch_size: int = 32) -> list[EmbeddingResult]:
        results = []
        for text in texts:
            response = await self._client.post("/api/embed", json={"model": self._model, "input": text})
            response.raise_for_status()
            data = response.json()
            results.append(EmbeddingResult(
                dense_embedding=data["embeddings"][0], model=self._model, provider="ollama",
            ))
        return results

    async def embed_query(self, query: str) -> EmbeddingResult:
        results = await self.embed_texts([query])
        return results[0]
