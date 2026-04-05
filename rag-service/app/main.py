"""FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.config import settings
from app.providers.llm.factory import create_llm_provider
from app.providers.embedding.factory import create_embedding_provider
from app.providers.reranker.factory import create_reranker_provider
from app.services.llm_router import LLMRouter
from app.services.search_service import SearchService
from app.services.rag_pipeline import RAGPipeline

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing providers...")

    embedding_provider = create_embedding_provider()
    reranker_provider = create_reranker_provider()
    llm_router = LLMRouter()

    search_service = SearchService(embedding_provider=embedding_provider)
    rag_pipeline = RAGPipeline(
        embedding_provider=embedding_provider,
        reranker_provider=reranker_provider,
        llm_router=llm_router,
        search_service=search_service,
    )

    app.state.embedding_provider = embedding_provider
    app.state.reranker_provider = reranker_provider
    app.state.llm_router = llm_router
    app.state.search_service = search_service
    app.state.rag_pipeline = rag_pipeline

    logger.info("All providers initialized.")
    yield


app = FastAPI(
    title="Dhara RAG Service",
    description="AI-powered legal research RAG pipeline for Bangladesh",
    version="0.1.0",
    lifespan=lifespan,
)

from app.routers import search_router, ask_router, embed_router
app.include_router(search_router.router, prefix="/search", tags=["search"])
app.include_router(ask_router.router, prefix="/ask", tags=["ask"])
app.include_router(embed_router.router, prefix="/embed", tags=["embed"])


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "providers": {
            "llm": settings.llm_provider,
            "embedding": settings.embedding_provider,
            "reranker": settings.reranker_provider,
            "router_mode": settings.llm_router_mode,
        },
    }
