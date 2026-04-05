"""Abstract provider protocols for all AI components."""

from __future__ import annotations

from typing import Protocol, runtime_checkable
from dataclasses import dataclass, field


@dataclass(frozen=True)
class LLMResponse:
    text: str
    model: str
    provider: str
    input_tokens: int
    output_tokens: int
    cost_usd: float


@dataclass(frozen=True)
class EmbeddingResult:
    dense_embedding: list[float]
    sparse_embedding: dict[int, float] | None = None
    model: str = ""
    provider: str = ""


@dataclass(frozen=True)
class RerankResult:
    index: int
    score: float
    text: str


@runtime_checkable
class LLMProvider(Protocol):
    @property
    def provider_name(self) -> str: ...
    @property
    def model_name(self) -> str: ...

    async def generate(
        self, prompt: str, system_prompt: str | None = None,
        temperature: float = 0.1, max_tokens: int = 2048,
    ) -> LLMResponse: ...

    async def health_check(self) -> bool: ...


@runtime_checkable
class EmbeddingProvider(Protocol):
    @property
    def provider_name(self) -> str: ...
    @property
    def model_name(self) -> str: ...
    @property
    def dimension(self) -> int: ...

    async def embed_texts(self, texts: list[str], batch_size: int = 32) -> list[EmbeddingResult]: ...
    async def embed_query(self, query: str) -> EmbeddingResult: ...


@runtime_checkable
class RerankerProvider(Protocol):
    @property
    def provider_name(self) -> str: ...

    async def rerank(self, query: str, documents: list[str], top_k: int = 5) -> list[RerankResult]: ...
