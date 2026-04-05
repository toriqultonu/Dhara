"""Embed router — generate embeddings for text."""

from fastapi import APIRouter, Request
from pydantic import BaseModel, Field

router = APIRouter()


class EmbedRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1)
    batch_size: int = Field(default=32, ge=1, le=256)


class EmbedResponse(BaseModel):
    embeddings: list[list[float]]
    model: str
    provider: str
    dimension: int


@router.post("", response_model=EmbedResponse)
async def embed(request: Request, body: EmbedRequest) -> EmbedResponse:
    embedding_provider = request.app.state.embedding_provider
    results = await embedding_provider.embed_texts(body.texts, batch_size=body.batch_size)
    return EmbedResponse(
        embeddings=[r.dense_embedding for r in results],
        model=embedding_provider.model_name,
        provider=embedding_provider.provider_name,
        dimension=embedding_provider.dimension,
    )
