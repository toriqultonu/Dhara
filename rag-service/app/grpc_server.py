"""grpc.aio server exposing RagService.

Shares the exact same service/provider instances as the HTTP routers —
the servicer is constructed with the already-built objects from the FastAPI
lifespan (dependency injection, nothing is re-created here). HTTP and gRPC
run in one process on the same asyncio event loop.
"""

import logging
import time

import grpc

from app.generated import rag_service_pb2, rag_service_pb2_grpc
from app.providers.base import EmbeddingProvider
from app.services.rag_pipeline import RAGPipeline
from app.services.search_service import SearchService

logger = logging.getLogger(__name__)

_DEFAULT_LANGUAGE = "bn"
_DEFAULT_TOP_K = 10
_DEFAULT_TIER = "FREE"


class RagServiceServicer(rag_service_pb2_grpc.RagServiceServicer):
    """Implements dhara.rag.RagService by delegating to the shared services."""

    def __init__(
        self,
        search_service: SearchService,
        rag_pipeline: RAGPipeline,
        embedding_provider: EmbeddingProvider,
    ) -> None:
        self._search_service = search_service
        self._rag_pipeline = rag_pipeline
        self._embedding_provider = embedding_provider

    async def Search(  # noqa: N802 — gRPC method names are fixed by the proto
        self,
        request: rag_service_pb2.SearchRequest,
        context: grpc.aio.ServicerContext,
    ) -> rag_service_pb2.SearchResponse:
        if not request.query:
            await context.abort(grpc.StatusCode.INVALID_ARGUMENT, "query must not be empty")

        start = time.perf_counter()
        try:
            results = await self._search_service.hybrid_search(
                query_text=request.query,
                language=request.language or _DEFAULT_LANGUAGE,
                top_k=request.top_k or _DEFAULT_TOP_K,
                filters=list(request.filters) or None,
            )
        except Exception as exc:  # pragma: no cover — defensive mapping to gRPC status
            logger.exception("gRPC Search failed")
            await context.abort(grpc.StatusCode.INTERNAL, f"search failed: {exc}")

        elapsed_ms = (time.perf_counter() - start) * 1000
        return rag_service_pb2.SearchResponse(
            results=[
                rag_service_pb2.SearchResult(
                    source_type=r.source_type,
                    source_id=r.source_id,
                    title=r.title,
                    snippet=r.snippet,
                    score=r.score,
                    metadata={str(k): str(v) for k, v in r.metadata.items()},
                )
                for r in results
            ],
            search_time_ms=round(elapsed_ms, 2),
        )

    async def Ask(  # noqa: N802
        self,
        request: rag_service_pb2.AskRequest,
        context: grpc.aio.ServicerContext,
    ) -> rag_service_pb2.AskResponse:
        if not request.question:
            await context.abort(grpc.StatusCode.INVALID_ARGUMENT, "question must not be empty")

        language = request.language or _DEFAULT_LANGUAGE
        user_tier = request.user_tier or _DEFAULT_TIER
        mode = request.mode or "rag"

        try:
            if mode == "document":
                if not request.document_text:
                    await context.abort(
                        grpc.StatusCode.INVALID_ARGUMENT,
                        "document_text required for document mode",
                    )
                result = await self._rag_pipeline.ask_with_document_context(
                    question=request.question,
                    document_text=request.document_text,
                    language=language,
                    user_tier=user_tier,
                )
            elif mode == "statute":
                if not request.statute_id:
                    await context.abort(
                        grpc.StatusCode.INVALID_ARGUMENT,
                        "statute_id required for statute mode",
                    )
                result = await self._rag_pipeline.ask(
                    question=request.question,
                    language=language,
                    user_tier=user_tier,
                    statute_id=request.statute_id,
                )
            elif mode == "rag":
                result = await self._rag_pipeline.ask(
                    question=request.question,
                    language=language,
                    user_tier=user_tier,
                )
            else:
                await context.abort(
                    grpc.StatusCode.INVALID_ARGUMENT, f"unknown mode: {mode}"
                )
        except grpc.aio.BaseError:
            # Raised by context.abort() above — propagate the original status.
            raise
        except Exception as exc:  # pragma: no cover — defensive mapping to gRPC status
            logger.exception("gRPC Ask failed")
            await context.abort(grpc.StatusCode.INTERNAL, f"ask failed: {exc}")

        return rag_service_pb2.AskResponse(
            answer=result.answer,
            citations=[
                rag_service_pb2.Citation(
                    source_type=c.source_type,
                    source_id=c.source_id,
                    title=c.title,
                    section_number=c.section_number or "",
                    snippet=c.snippet,
                )
                for c in result.citations
            ],
            llm_provider=result.llm_provider,
            llm_model=result.llm_model,
            tokens_used=result.tokens_used,
            cost_usd=result.cost_usd,
        )

    async def GenerateEmbedding(  # noqa: N802
        self,
        request: rag_service_pb2.EmbeddingRequest,
        context: grpc.aio.ServicerContext,
    ) -> rag_service_pb2.EmbeddingResponse:
        if not request.texts:
            await context.abort(grpc.StatusCode.INVALID_ARGUMENT, "texts must not be empty")

        try:
            results = await self._embedding_provider.embed_texts(list(request.texts))
        except Exception as exc:  # pragma: no cover — defensive mapping to gRPC status
            logger.exception("gRPC GenerateEmbedding failed")
            await context.abort(grpc.StatusCode.INTERNAL, f"embedding failed: {exc}")

        return rag_service_pb2.EmbeddingResponse(
            embeddings=[
                rag_service_pb2.EmbeddingVector(values=r.dense_embedding) for r in results
            ],
            model=self._embedding_provider.model_name,
            dimension=self._embedding_provider.dimension,
        )


def create_grpc_server(
    search_service: SearchService,
    rag_pipeline: RAGPipeline,
    embedding_provider: EmbeddingProvider,
    port: int,
) -> grpc.aio.Server:
    """Build (but do not start) the aio gRPC server bound to the given port."""
    server = grpc.aio.server()
    rag_service_pb2_grpc.add_RagServiceServicer_to_server(
        RagServiceServicer(
            search_service=search_service,
            rag_pipeline=rag_pipeline,
            embedding_provider=embedding_provider,
        ),
        server,
    )
    server.add_insecure_port(f"[::]:{port}")
    return server
