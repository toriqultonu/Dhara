"""Test no-op reranker."""

import pytest
from app.providers.reranker.noop_reranker import NoopRerankerProvider


@pytest.mark.asyncio
async def test_noop_reranker_returns_top_k():
    reranker = NoopRerankerProvider()
    docs = ["doc1", "doc2", "doc3", "doc4", "doc5", "doc6"]
    results = await reranker.rerank("query", docs, top_k=3)
    assert len(results) == 3
    assert results[0].text == "doc1"
    assert results[0].score > results[1].score


@pytest.mark.asyncio
async def test_noop_reranker_provider_name():
    reranker = NoopRerankerProvider()
    assert reranker.provider_name == "noop"
