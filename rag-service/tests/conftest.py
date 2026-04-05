"""Shared test fixtures with mock providers."""

import pytest
from app.providers.base import LLMResponse, EmbeddingResult, RerankResult


class MockLLMProvider:
    provider_name = "mock"
    model_name = "mock-1.0"

    async def generate(self, prompt, system_prompt=None, **kwargs):
        return LLMResponse(
            text="Mock answer citing [Source 1] and [Source 2].",
            model="mock-1.0", provider="mock",
            input_tokens=100, output_tokens=50, cost_usd=0.0,
        )

    async def health_check(self):
        return True


class MockEmbeddingProvider:
    provider_name = "mock"
    model_name = "mock-embed"
    dimension = 1024

    async def embed_texts(self, texts, batch_size=32):
        return [EmbeddingResult(dense_embedding=[0.1] * 1024, model="mock-embed", provider="mock") for _ in texts]

    async def embed_query(self, query):
        return EmbeddingResult(dense_embedding=[0.1] * 1024, model="mock-embed", provider="mock")


class MockRerankerProvider:
    provider_name = "mock"

    async def rerank(self, query, documents, top_k=5):
        return [
            RerankResult(index=i, score=1.0 - (i * 0.1), text=doc)
            for i, doc in enumerate(documents[:top_k])
        ]


@pytest.fixture
def mock_llm():
    return MockLLMProvider()


@pytest.fixture
def mock_embedder():
    return MockEmbeddingProvider()


@pytest.fixture
def mock_reranker():
    return MockRerankerProvider()
