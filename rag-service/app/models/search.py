"""Search request/response models."""

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    language: str = Field(default="bn", pattern="^(bn|en)$")
    top_k: int = Field(default=10, ge=1, le=50)
    filters: list[str] = Field(default_factory=lambda: ["statutes", "judgments", "sros"])


class SearchResult(BaseModel):
    source_type: str
    source_id: int
    title: str
    snippet: str
    score: float
    metadata: dict[str, str] = Field(default_factory=dict)


class SearchResponse(BaseModel):
    results: list[SearchResult]
    search_time_ms: float
