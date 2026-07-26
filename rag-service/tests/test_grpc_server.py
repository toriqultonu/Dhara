"""Tests for the aio gRPC servicer — direct method calls, no real network."""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.generated import rag_service_pb2
from app.grpc_server import RagServiceServicer
from app.models.ask import Citation, RAGResponse
from app.models.search import SearchResult


class _AbortCalled(Exception):
    """Raised by the fake context so aborts terminate the handler like real gRPC."""


def _make_context() -> MagicMock:
    context = MagicMock()
    context.abort = AsyncMock(side_effect=_AbortCalled)
    return context


@pytest.fixture
def mock_search_service():
    service = MagicMock()
    service.hybrid_search = AsyncMock(
        return_value=[
            SearchResult(
                source_type="statute",
                source_id=42,
                title="Penal Code, 1860",
                snippet="Section 302: Punishment for murder...",
                score=0.91,
                metadata={"title": "Penal Code, 1860"},
            )
        ]
    )
    return service


@pytest.fixture
def mock_rag_pipeline():
    pipeline = MagicMock()
    response = RAGResponse(
        answer="Murder is punishable under section 302 [Source 1].",
        citations=[
            Citation(
                source_type="statute",
                source_id=42,
                title="Penal Code, 1860",
                section_number="302",
                snippet="Section 302: Punishment for murder...",
            )
        ],
        llm_provider="mock",
        llm_model="mock-1.0",
        tokens_used=150,
        cost_usd=0.0,
    )
    pipeline.ask = AsyncMock(return_value=response)
    pipeline.ask_with_document_context = AsyncMock(return_value=response)
    return pipeline


@pytest.fixture
def servicer(mock_search_service, mock_rag_pipeline, mock_embedder):
    return RagServiceServicer(
        search_service=mock_search_service,
        rag_pipeline=mock_rag_pipeline,
        embedding_provider=mock_embedder,
    )


class TestSearch:
    async def test_search_happy_path(self, servicer, mock_search_service):
        request = rag_service_pb2.SearchRequest(
            query="murder punishment", language="en", top_k=5, filters=["statutes"]
        )
        response = await servicer.Search(request, _make_context())

        assert len(response.results) == 1
        result = response.results[0]
        assert result.source_type == "statute"
        assert result.source_id == 42
        assert result.title == "Penal Code, 1860"
        assert result.score == pytest.approx(0.91)
        assert result.metadata["title"] == "Penal Code, 1860"
        assert response.search_time_ms >= 0

        mock_search_service.hybrid_search.assert_awaited_once_with(
            query_text="murder punishment", language="en", top_k=5, filters=["statutes"]
        )

    async def test_search_applies_defaults(self, servicer, mock_search_service):
        request = rag_service_pb2.SearchRequest(query="জামিন")
        await servicer.Search(request, _make_context())

        mock_search_service.hybrid_search.assert_awaited_once_with(
            query_text="জামিন", language="bn", top_k=10, filters=None
        )

    async def test_search_empty_query_aborts(self, servicer, mock_search_service):
        context = _make_context()
        with pytest.raises(_AbortCalled):
            await servicer.Search(rag_service_pb2.SearchRequest(query=""), context)
        context.abort.assert_awaited_once()
        mock_search_service.hybrid_search.assert_not_awaited()


class TestAsk:
    async def test_ask_happy_path_rag_mode(self, servicer, mock_rag_pipeline):
        request = rag_service_pb2.AskRequest(
            question="What is the punishment for murder?", language="en", user_tier="PRO"
        )
        response = await servicer.Ask(request, _make_context())

        assert "302" in response.answer
        assert response.llm_provider == "mock"
        assert response.llm_model == "mock-1.0"
        assert response.tokens_used == 150
        assert len(response.citations) == 1
        citation = response.citations[0]
        assert citation.source_type == "statute"
        assert citation.source_id == 42
        assert citation.section_number == "302"

        mock_rag_pipeline.ask.assert_awaited_once_with(
            question="What is the punishment for murder?", language="en", user_tier="PRO"
        )

    async def test_ask_document_mode(self, servicer, mock_rag_pipeline):
        request = rag_service_pb2.AskRequest(
            question="Summarize this contract", mode="document", document_text="This deed..."
        )
        response = await servicer.Ask(request, _make_context())

        assert response.answer
        mock_rag_pipeline.ask_with_document_context.assert_awaited_once_with(
            question="Summarize this contract",
            document_text="This deed...",
            language="bn",
            user_tier="FREE",
        )
        mock_rag_pipeline.ask.assert_not_awaited()

    async def test_ask_statute_mode(self, servicer, mock_rag_pipeline):
        request = rag_service_pb2.AskRequest(
            question="Explain section 302", mode="statute", statute_id=42
        )
        await servicer.Ask(request, _make_context())

        mock_rag_pipeline.ask.assert_awaited_once_with(
            question="Explain section 302", language="bn", user_tier="FREE", statute_id=42
        )

    async def test_ask_document_mode_without_text_aborts(self, servicer, mock_rag_pipeline):
        context = _make_context()
        request = rag_service_pb2.AskRequest(question="Summarize", mode="document")
        with pytest.raises(_AbortCalled):
            await servicer.Ask(request, context)
        mock_rag_pipeline.ask_with_document_context.assert_not_awaited()

    async def test_ask_empty_question_aborts(self, servicer, mock_rag_pipeline):
        context = _make_context()
        with pytest.raises(_AbortCalled):
            await servicer.Ask(rag_service_pb2.AskRequest(question=""), context)
        mock_rag_pipeline.ask.assert_not_awaited()


class TestGenerateEmbedding:
    async def test_generate_embedding_happy_path(self, servicer):
        request = rag_service_pb2.EmbeddingRequest(texts=["hello", "আইন"])
        response = await servicer.GenerateEmbedding(request, _make_context())

        assert len(response.embeddings) == 2
        assert len(response.embeddings[0].values) == 1024
        assert response.model == "mock-embed"
        assert response.dimension == 1024

    async def test_generate_embedding_empty_texts_aborts(self, servicer):
        context = _make_context()
        with pytest.raises(_AbortCalled):
            await servicer.GenerateEmbedding(rag_service_pb2.EmbeddingRequest(), context)
        context.abort.assert_awaited_once()
