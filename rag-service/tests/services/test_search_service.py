"""Tests for SearchService: hybrid weights, filter allowlist, parameterization."""

from types import SimpleNamespace
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.config import settings
from app.services.search_service import ALLOWED_SOURCE_TYPES, SearchService


def make_row(
    source_type: str = "statute", source_id: int = 100,
    content: str = "Section 302: punishment for murder",
    title: str = "Penal Code 1860", combined_score: float = 0.87,
) -> SimpleNamespace:
    return SimpleNamespace(
        id=1, source_type=source_type, source_id=source_id,
        content=content, metadata={"title": title}, combined_score=combined_score,
    )


@pytest.fixture
def mock_session(monkeypatch: pytest.MonkeyPatch) -> AsyncMock:
    session = AsyncMock()
    result = MagicMock()
    result.fetchall.return_value = [make_row()]
    session.execute.return_value = result

    session_cls = MagicMock()
    ctx = session_cls.return_value
    ctx.__aenter__ = AsyncMock(return_value=session)
    ctx.__aexit__ = AsyncMock(return_value=False)
    monkeypatch.setattr("app.services.search_service.AsyncSession", session_cls)
    monkeypatch.setattr(
        "app.services.search_service.create_async_engine", MagicMock(return_value=MagicMock())
    )
    return session


@pytest.fixture
def service(mock_session: AsyncMock, mock_embedder) -> SearchService:
    return SearchService(embedding_provider=mock_embedder)


def executed_sql_and_params(session: AsyncMock) -> tuple[str, dict[str, Any]]:
    args = session.execute.await_args.args
    # TextClause.text is the raw SQL string (str() would render expanding
    # bindparams as POSTCOMPILE markers).
    raw_sql = getattr(args[0], "text", str(args[0]))
    return raw_sql, args[1]


class TestHybridWeights:
    async def test_weights_and_limits_bound_from_settings(
        self, service: SearchService, mock_session: AsyncMock
    ) -> None:
        results = await service.hybrid_search("murder punishment", top_k=7)

        sql, params = executed_sql_and_params(mock_session)
        assert params["vector_weight"] == settings.search_vector_weight
        assert params["bm25_weight"] == settings.search_bm25_weight
        assert params["top_k"] == 7
        assert params["limit"] == 21  # over-fetch: top_k * 3
        assert ":vector_weight" in sql and ":bm25_weight" in sql

        assert len(results) == 1
        assert results[0].score == pytest.approx(0.87)
        assert results[0].title == "Penal Code 1860"
        assert results[0].snippet.startswith("Section 302")

    async def test_query_embedding_generated_and_bound(
        self, service: SearchService, mock_session: AsyncMock
    ) -> None:
        await service.hybrid_search("ধারা ৩০২")
        _, params = executed_sql_and_params(mock_session)
        # Mock embedder returns [0.1] * 1024
        assert params["embedding"].startswith("[0.1,0.1,")
        assert params["query"] == "ধারা ৩০২"


class TestFilterAllowlist:
    async def test_valid_filters_bound_as_parameters(
        self, service: SearchService, mock_session: AsyncMock
    ) -> None:
        await service.hybrid_search("appeal", filters=["judgments", "statutes"])
        sql, params = executed_sql_and_params(mock_session)
        assert params["source_types"] == ["judgment", "statute"]
        assert "dc.source_type IN :source_types" in sql
        # No literal values interpolated into the SQL text.
        assert "'judgment'" not in sql
        assert "'statute'" not in sql

    async def test_invalid_filter_ignored(
        self, service: SearchService, mock_session: AsyncMock
    ) -> None:
        await service.hybrid_search("appeal", filters=["judgments", "bogus_type"])
        sql, params = executed_sql_and_params(mock_session)
        assert params["source_types"] == ["judgment"]
        assert "bogus_type" not in sql
        assert "bogus" not in str(params["source_types"])

    async def test_all_invalid_filters_means_no_filter_clause(
        self, service: SearchService, mock_session: AsyncMock
    ) -> None:
        await service.hybrid_search("appeal", filters=["nonsense"])
        sql, params = executed_sql_and_params(mock_session)
        assert "source_types" not in params
        assert "source_type IN" not in sql

    async def test_allowlist_is_exactly_the_three_source_types(self) -> None:
        assert ALLOWED_SOURCE_TYPES == {"statute", "judgment", "sro"}


class TestSqlInjectionPrevention:
    async def test_malicious_filter_never_reaches_sql(
        self, service: SearchService, mock_session: AsyncMock
    ) -> None:
        malicious = "judgment') OR 1=1; DROP TABLE document_chunks;--"
        await service.hybrid_search("appeal", filters=[malicious])
        sql, params = executed_sql_and_params(mock_session)
        assert malicious not in sql
        assert "DROP TABLE" not in sql
        assert "1=1" not in sql
        # Rejected by the allowlist — not even bound as a parameter.
        assert "source_types" not in params

    async def test_bengali_injection_attempt_rejected(
        self, service: SearchService, mock_session: AsyncMock
    ) -> None:
        malicious = "ধারা'; DELETE FROM document_chunks;--"
        await service.hybrid_search("query", filters=[malicious])
        sql, params = executed_sql_and_params(mock_session)
        assert "DELETE" not in sql
        assert malicious not in sql
        assert "source_types" not in params

    async def test_statute_id_bound_not_interpolated(
        self, service: SearchService, mock_session: AsyncMock
    ) -> None:
        await service.hybrid_search("section", statute_id=42)
        sql, params = executed_sql_and_params(mock_session)
        assert ":statute_id" in sql
        assert params["statute_id"] == 42
        assert "= 42" not in sql


class TestStatuteIdOverridesFilters:
    async def test_statute_id_ignores_conflicting_filters(
        self, service: SearchService, mock_session: AsyncMock
    ) -> None:
        # Rule: statute_id implies statute-only; user filters are ignored,
        # never ANDed into a contradiction.
        await service.hybrid_search("section", filters=["judgments"], statute_id=7)
        sql, params = executed_sql_and_params(mock_session)
        assert params["statute_id"] == 7
        assert "source_types" not in params
        assert "judgment" not in sql
        assert "dc.source_type = 'statute'" in sql
        assert "dc.source_id = :statute_id" in sql
