"""BGE-M3 embedding provider — local model via FlagEmbedding."""

import asyncio
from functools import partial
from app.providers.base import EmbeddingResult
from app.config import settings


class BGEM3EmbeddingProvider:
    def __init__(self, model_path: str | None = None, use_fp16: bool | None = None):
        from FlagEmbedding import BGEM3FlagModel
        self._model_path = model_path or settings.bgem3_model_path
        self._use_fp16 = use_fp16 if use_fp16 is not None else settings.bgem3_use_fp16
        self._model = BGEM3FlagModel(self._model_path, use_fp16=self._use_fp16)

    @property
    def provider_name(self) -> str:
        return "bgem3"

    @property
    def model_name(self) -> str:
        return self._model_path

    @property
    def dimension(self) -> int:
        return 1024

    async def embed_texts(self, texts: list[str], batch_size: int = 32) -> list[EmbeddingResult]:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, partial(self._model.encode, texts, batch_size=batch_size,
                          return_dense=True, return_sparse=True)
        )
        dense = result["dense_vecs"]
        sparse = result.get("lexical_weights", [None] * len(texts))
        return [
            EmbeddingResult(
                dense_embedding=dense[i].tolist(),
                sparse_embedding=dict(sparse[i]) if sparse[i] is not None else None,
                model=self._model_path, provider="bgem3",
            )
            for i in range(len(texts))
        ]

    async def embed_query(self, query: str) -> EmbeddingResult:
        results = await self.embed_texts([query])
        return results[0]
