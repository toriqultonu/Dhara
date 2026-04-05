"""Batch embedding pipeline for all legal documents.

Reads statutes, judgments, and SROs from PostgreSQL,
generates embeddings via the configured provider,
and stores them in the document_chunks table.

Usage:
    uv run python scripts/embed_all_documents.py
"""

import asyncio
import logging
import time
from typing import AsyncGenerator

import asyncpg

from app.config import get_settings
from app.providers.embedding.factory import create_embedding_provider

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

BATCH_SIZE = 32


async def fetch_documents(
    pool: asyncpg.Pool, doc_type: str, table: str, text_column: str
) -> AsyncGenerator[list[dict], None]:
    """Yield batches of documents that don't have embeddings yet."""
    query = f"""
        SELECT t.id, t.{text_column} AS text, t.title
        FROM {table} t
        LEFT JOIN document_chunks dc ON dc.source_id = t.id::text AND dc.doc_type = $1
        WHERE dc.id IS NULL AND t.{text_column} IS NOT NULL
        ORDER BY t.id
    """
    rows = await pool.fetch(query, doc_type)
    batch: list[dict] = []
    for row in rows:
        batch.append(dict(row))
        if len(batch) >= BATCH_SIZE:
            yield batch
            batch = []
    if batch:
        yield batch


async def store_embeddings(
    pool: asyncpg.Pool,
    doc_type: str,
    docs: list[dict],
    embeddings: list[list[float]],
) -> None:
    """Insert embeddings into document_chunks table."""
    async with pool.acquire() as conn:
        for doc, embedding in zip(docs, embeddings):
            text = doc["text"][:2000]
            await conn.execute(
                """
                INSERT INTO document_chunks (doc_type, source_id, chunk_index, content, embedding)
                VALUES ($1, $2, 0, $3, $4)
                ON CONFLICT DO NOTHING
                """,
                doc_type,
                str(doc["id"]),
                text,
                str(embedding),
            )


async def main() -> None:
    settings = get_settings()
    db_url = settings.database_url.replace("+asyncpg", "")
    pool = await asyncpg.create_pool(db_url)

    embedding_provider = create_embedding_provider(
        provider_type=settings.embedding_provider,
        model=settings.embedding_model,
        base_url=settings.ollama_base_url,
    )

    document_sources = [
        ("statute", "statutes", "full_text"),
        ("judgment", "judgments", "full_text"),
        ("sro", "sros", "content"),
    ]

    total_embedded = 0
    start_time = time.time()

    for doc_type, table, text_col in document_sources:
        logger.info("Processing %s from %s...", doc_type, table)
        count = 0
        async for batch in fetch_documents(pool, doc_type, table, text_col):
            texts = [doc["text"][:2000] for doc in batch]
            result = await embedding_provider.embed(texts)
            await store_embeddings(pool, doc_type, batch, result.embeddings)
            count += len(batch)
            logger.info("  Embedded %d %s documents so far", count, doc_type)
        total_embedded += count

    elapsed = time.time() - start_time
    logger.info(
        "Done. Embedded %d total documents in %.1f seconds.", total_embedded, elapsed
    )
    await pool.close()


if __name__ == "__main__":
    asyncio.run(main())
