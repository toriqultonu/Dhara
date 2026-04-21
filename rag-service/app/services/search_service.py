"""Hybrid search service — vector similarity + BM25 full-text search."""

import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text

from app.providers.base import EmbeddingProvider
from app.models.search import SearchResult
from app.config import settings

logger = logging.getLogger(__name__)


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

        filter_clause = ""
        if filters:
            types = ",".join(f"'{f.rstrip('s')}'" for f in filters)
            filter_clause = f"AND dc.source_type IN ({types})"
        if statute_id is not None:
            filter_clause += f" AND dc.source_type = 'statute' AND dc.source_id = {int(statute_id)}"

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

        async with AsyncSession(self._engine) as session:
            result = await session.execute(sql, {
                "embedding": embedding_str, "query": query_text,
                "limit": top_k * 3, "top_k": top_k,
                "vector_weight": settings.search_vector_weight,
                "bm25_weight": settings.search_bm25_weight,
            })
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
