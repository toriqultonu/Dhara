"""BGE Reranker provider — local model."""

import asyncio
from functools import partial
from app.providers.base import RerankResult


class BGERerankerProvider:
    def __init__(self, model_path: str = "BAAI/bge-reranker-v2-m3"):
        from FlagEmbedding import FlagReranker
        self._model = FlagReranker(model_path, use_fp16=True)

    @property
    def provider_name(self) -> str:
        return "bge"

    async def rerank(self, query: str, documents: list[str], top_k: int = 5) -> list[RerankResult]:
        pairs = [[query, doc] for doc in documents]
        loop = asyncio.get_event_loop()
        scores = await loop.run_in_executor(None, partial(self._model.compute_score, pairs))
        if isinstance(scores, float):
            scores = [scores]

        indexed = [(i, scores[i], documents[i]) for i in range(len(documents))]
        indexed.sort(key=lambda x: x[1], reverse=True)
        return [RerankResult(index=idx, score=score, text=text) for idx, score, text in indexed[:top_k]]
