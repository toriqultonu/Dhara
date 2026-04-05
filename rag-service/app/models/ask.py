"""Ask/RAG request/response models."""

from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    language: str = Field(default="bn", pattern="^(bn|en)$")
    user_tier: str = Field(default="FREE")


class Citation(BaseModel):
    source_type: str
    source_id: int
    title: str
    section_number: str | None = None
    snippet: str


class AskResponse(BaseModel):
    answer: str
    citations: list[Citation]
    llm_provider: str
    llm_model: str
    tokens_used: int
    cost_usd: float


class RAGResponse(BaseModel):
    answer: str
    citations: list[Citation]
    llm_provider: str
    llm_model: str
    tokens_used: int
    cost_usd: float
