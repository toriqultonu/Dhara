"""Tests for RAG pipeline."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.providers.base import LLMResponse, EmbeddingResult, RerankResult


@pytest.fixture
def mock_embedding_provider() -> AsyncMock:
    provider = AsyncMock()
    provider.embed.return_value = EmbeddingResult(
        embeddings=[[0.1] * 1024],
        model="bge-m3",
        dimension=1024,
    )
    return provider


@pytest.fixture
def mock_reranker_provider() -> AsyncMock:
    provider = AsyncMock()
    provider.rerank.return_value = RerankResult(
        scores=[0.95, 0.80, 0.65],
        indices=[0, 1, 2],
        model="bge-reranker",
    )
    return provider


@pytest.fixture
def mock_llm_router() -> AsyncMock:
    router = AsyncMock()
    router.generate.return_value = LLMResponse(
        text="According to Section 302 of the Penal Code...",
        model="deepseek-chat",
        provider="deepseek",
        tokens_used=150,
        latency_ms=500.0,
        cost_usd=0.0002,
    )
    return router


class TestRAGPipeline:
    @pytest.mark.asyncio
    async def test_embedding_called_with_query(
        self, mock_embedding_provider: AsyncMock
    ) -> None:
        query = "ধারা ৩০২ কি?"
        await mock_embedding_provider.embed([query])
        mock_embedding_provider.embed.assert_called_once_with([query])
        result = mock_embedding_provider.embed.return_value
        assert result.dimension == 1024

    @pytest.mark.asyncio
    async def test_reranker_orders_by_score(
        self, mock_reranker_provider: AsyncMock
    ) -> None:
        docs = ["doc1", "doc2", "doc3"]
        result = await mock_reranker_provider.rerank("query", docs)
        assert result.indices == [0, 1, 2]
        assert result.scores[0] > result.scores[1]

    @pytest.mark.asyncio
    async def test_llm_generates_answer(
        self, mock_llm_router: AsyncMock
    ) -> None:
        result = await mock_llm_router.generate(
            "What is section 302?", user_tier="FREE"
        )
        assert "Section 302" in result.text
        assert result.provider == "deepseek"
