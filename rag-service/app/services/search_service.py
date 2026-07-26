"""Hybrid search service — vector similarity + BM25 full-text search."""

import logging
from typing import Any

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import bindparam, text

from app.providers.base import EmbeddingProvider
from app.models.search import SearchResult
from app.config import settings

logger = logging.getLogger(__name__)

# Only these source types may ever appear in a filter. Anything else is
# ignored — and even valid values are bound as parameters, never
# interpolated into SQL.
ALLOWED_SOURCE_TYPES: frozenset[str] = frozenset({"statute", "judgment", "sro"})


class SearchService:
    def __init__(self, embedding_provider: EmbeddingProvider):
        self._embedder = embedding_provider
        self._engine = create_async_engine(settings.database_url, pool_size=10, max_overflow=20)

    async def hybrid_search(
        self, query_text: str, language: str = "bn",
        top_k: int = 10, filters: list[str] | None = None,
        statute_id: int | None = None,
    ) -> list[SearchResult]:
        query_embedding = await self._embedder.embed_query(query_text)
        embedding_str = "[" + ",".join(str(v) for v in query_embedding.dense_embedding) + "]"

        params: dict[str, Any] = {
            "embedding": embedding_str, "query": query_text,
            "limit": top_k * 3, "top_k": top_k,
            "vector_weight": settings.search_vector_weight,
            "bm25_weight": settings.search_bm25_weight,
        }

        filter_clause = ""
        if statute_id is not None:
            # Rule: statute_id implies a statute-only search. Any user-supplied
            # source-type filters are IGNORED (not ANDed on top), because
            # combining them can produce contradictory conditions (e.g.
            # filters=["judgments"] + statute_id) that silently return nothing.
            if filters:
                logger.debug(
                    "statute_id=%s provided; ignoring source-type filters %s",
                    statute_id, filters,
                )
            filter_clause = "AND dc.source_type = 'statute' AND dc.source_id = :statute_id"
            params["statute_id"] = int(statute_id)
        elif filters:
            normalized = [f.rstrip("s").lower() for f in filters]
            source_types = [t for t in normalized if t in ALLOWED_SOURCE_TYPES]
            invalid = [f for f, t in zip(filters, normalized) if t not in ALLOWED_SOURCE_TYPES]
            if invalid:
                logger.warning("Ignoring invalid source-type filters: %s", invalid)
            if source_types:
                filter_clause = "AND dc.source_type IN :source_types"
                params["source_types"] = source_types

        sql = text(f"""
            WITH vector_results AS (
                SELECT dc.id, dc.source_type, dc.source_id, dc.content, dc.metadata,
                       1 - (dc.embedding <=> :embedding::vector) AS vector_score
                FROM document_chunks dc
                WHERE dc.embedding IS NOT NULL {filter_clause}
                ORDER BY dc.embedding <=> :embedding::vector
                LIMIT :limit
            ),
            bm25_results AS (
                SELECT dc.id, dc.source_type, dc.source_id, dc.content, dc.metadata,
                       ts_rank(dc.content_tsvector, plainto_tsquery('english', :query)) AS bm25_score
                FROM document_chunks dc
                WHERE dc.content_tsvector @@ plainto_tsquery('english', :query) {filter_clause}
                ORDER BY bm25_score DESC
                LIMIT :limit
            )
            SELECT COALESCE(v.id, b.id) AS id,
                   COALESCE(v.source_type, b.source_type) AS source_type,
                   COALESCE(v.source_id, b.source_id) AS source_id,
                   COALESCE(v.content, b.content) AS content,
                   COALESCE(v.metadata, b.metadata) AS metadata,
                   COALESCE(v.vector_score, 0) * :vector_weight +
                   COALESCE(b.bm25_score, 0) * :bm25_weight AS combined_score
            FROM vector_results v
            FULL OUTER JOIN bm25_results b ON v.id = b.id
            ORDER BY combined_score DESC
            LIMIT :top_k
        """)
        if "source_types" in params:
            sql = sql.bindparams(bindparam("source_types", expanding=True))

        async with AsyncSession(self._engine) as session:
            result = await session.execute(sql, params)
            rows = result.fetchall()

        return [
            SearchResult(
                source_type=row.source_type, source_id=row.source_id,
                title=row.metadata.get("title", "") if isinstance(row.metadata, dict) else "",
                snippet=row.content[:300] if row.content else "",
                score=float(row.combined_score),
                metadata=row.metadata if isinstance(row.metadata, dict) else {},
            )
            for row in rows
        ]
