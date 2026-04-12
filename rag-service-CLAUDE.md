# CLAUDE.md — Dhara RAG Service (Python FastAPI)

> **Service:** `rag-service/` — Python 3.11+ FastAPI
> **Role:** RAG pipeline, embeddings, LLM routing, re-ranking, gRPC server
> **Port:** 8000 (HTTP), 50051 (gRPC)
> **Package Manager:** `uv`

---

## 📌 Service Responsibilities

1. **Embedding Generation** — Encode legal text into vectors (pluggable provider)
2. **Hybrid Search** — pgvector cosine similarity + PostgreSQL BM25 full-text search
3. **Re-ranking** — Cross-encoder re-scoring of top results (pluggable provider)
4. **LLM Q&A** — Generate cited legal answers using RAG (pluggable provider)
5. **Smart LLM Routing** — Route queries to the cheapest adequate LLM based on complexity + user tier
6. **gRPC Server** — Expose all above to Spring Boot backend

---

## ⭐ PROVIDER ABSTRACTION — THE CORE DESIGN PATTERN

> **This is the most important architectural decision in the entire project.**
>
> Every AI component (LLM, Embedding, Reranker) MUST be behind an abstract Protocol.
> The active provider is selected at startup via environment variables.
> Switching models requires ZERO code changes — only `.env` changes.

### Why This Matters

- **Local dev:** Use Ollama (free, fast iteration, GPU)
- **Production:** Use API providers (DeepSeek, Gemini, Claude) with smart routing
- **Testing:** Use a mock provider that returns deterministic results
- **Future-proofing:** New model released? Add a provider file, update `.env`. Done.

---

## 🏗️ Provider Architecture

### Directory Structure

```
app/providers/
├── __init__.py              # Re-exports all protocols and factories
├── base.py                  # ★ Abstract Protocols (the contracts)
│
├── llm/
│   ├── __init__.py
│   ├── ollama_provider.py   # Ollama local (any model: qwen3, gemma3, deepseek-r1, etc.)
│   ├── deepseek_provider.py # DeepSeek V3 API
│   ├── gemini_provider.py   # Google Gemini 2.5 Flash API
│   ├── claude_provider.py   # Anthropic Claude Sonnet API
│   ├── openai_provider.py   # OpenAI-compatible API (works with any OpenAI-format endpoint)
│   └── factory.py           # LLMProviderFactory
│
├── embedding/
│   ├── __init__.py
│   ├── bgem3_provider.py    # Local BGE-M3 via FlagEmbedding library
│   ├── ollama_provider.py   # Ollama embeddings (nomic-embed-text, bge-m3, etc.)
│   ├── openai_provider.py   # OpenAI Embedding API (text-embedding-3-small, etc.)
│   └── factory.py           # EmbeddingProviderFactory
│
└── reranker/
    ├── __init__.py
    ├── bge_reranker.py      # Local bge-reranker-v2-m3 via FlagEmbedding
    ├── cohere_reranker.py   # Cohere Rerank API
    ├── noop_reranker.py     # Passthrough (no reranking) — for testing/budget mode
    └── factory.py           # RerankerProviderFactory
```

### Protocol Definitions (`app/providers/base.py`)

```python
"""
Abstract provider protocols for all AI components.

RULES:
1. Every provider implements exactly one Protocol.
2. All methods are async.
3. Providers are stateless after initialization.
4. Config comes from environment variables via pydantic-settings.
5. Providers handle their own errors and return standardized results.
"""

from __future__ import annotations
from typing import Protocol, runtime_checkable
from dataclasses import dataclass


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Data Classes (shared across all providers)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@dataclass(frozen=True)
class LLMResponse:
    """Standardized LLM response."""
    text: str
    model: str                   # e.g. "qwen3:14b", "gemini-2.5-flash"
    provider: str                # e.g. "ollama", "gemini", "claude"
    input_tokens: int
    output_tokens: int
    cost_usd: float              # 0.0 for local models


@dataclass(frozen=True)
class EmbeddingResult:
    """Standardized embedding result."""
    dense_embedding: list[float]       # Dense vector (1024-dim for BGE-M3)
    sparse_embedding: dict[int, float] | None = None  # Sparse/lexical weights (optional)
    model: str = ""
    provider: str = ""


@dataclass(frozen=True)
class RerankResult:
    """A single reranked item."""
    index: int                   # Original index in the input list
    score: float                 # Relevance score (0.0 - 1.0)
    text: str                    # The document text


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Provider Protocols (the contracts)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@runtime_checkable
class LLMProvider(Protocol):
    """
    Contract for all LLM providers.
    Implementations: Ollama, DeepSeek, Gemini, Claude, OpenAI-compatible.
    """

    @property
    def provider_name(self) -> str:
        """Unique provider identifier, e.g. 'ollama', 'deepseek', 'gemini'."""
        ...

    @property
    def model_name(self) -> str:
        """Model identifier, e.g. 'qwen3:14b', 'gemini-2.5-flash'."""
        ...

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.1,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        """Generate text from a prompt. Returns standardized LLMResponse."""
        ...

    async def health_check(self) -> bool:
        """Check if the provider is available and responding."""
        ...


@runtime_checkable
class EmbeddingProvider(Protocol):
    """
    Contract for all embedding providers.
    Implementations: BGE-M3 (local), Ollama, OpenAI.
    """

    @property
    def provider_name(self) -> str:
        ...

    @property
    def model_name(self) -> str:
        ...

    @property
    def dimension(self) -> int:
        """Embedding vector dimension (e.g. 1024 for BGE-M3)."""
        ...

    async def embed_texts(
        self,
        texts: list[str],
        batch_size: int = 32,
    ) -> list[EmbeddingResult]:
        """Embed a list of texts. Returns one EmbeddingResult per text."""
        ...

    async def embed_query(self, query: str) -> EmbeddingResult:
        """Embed a single query (may use different encoding than documents)."""
        ...


@runtime_checkable
class RerankerProvider(Protocol):
    """
    Contract for all reranker providers.
    Implementations: BGE-Reranker (local), Cohere, Noop.
    """

    @property
    def provider_name(self) -> str:
        ...

    async def rerank(
        self,
        query: str,
        documents: list[str],
        top_k: int = 5,
    ) -> list[RerankResult]:
        """Rerank documents by relevance to query. Returns top_k results sorted by score."""
        ...
```

### Example Provider Implementation: Ollama LLM (`app/providers/llm/ollama_provider.py`)

```python
"""
Ollama LLM provider — works with ANY model available in Ollama.

Usage:
    LLM_PROVIDER=ollama
    OLLAMA_BASE_URL=http://localhost:11434
    OLLAMA_MODEL=qwen3:14b          # Change to any model: gemma3:12b, deepseek-r1:14b, etc.

Switching local models:
    1. Pull new model: `ollama pull <model-name>`
    2. Update .env.example: OLLAMA_MODEL=<model-name>
    3. Restart rag-service. Done.
"""

import httpx
from app.providers.base import LLMProvider, LLMResponse
from app.config import settings


class OllamaLLMProvider:
    """LLM provider using Ollama local inference."""

    def __init__(
        self,
        base_url: str | None = None,
        model: str | None = None,
    ):
        self._base_url = base_url or settings.ollama_base_url
        self._model = model or settings.ollama_model
        self._client = httpx.AsyncClient(
            base_url=self._base_url,
            timeout=120.0,  # Local LLMs can be slow on first call
        )

    @property
    def provider_name(self) -> str:
        return "ollama"

    @property
    def model_name(self) -> str:
        return self._model

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.1,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self._client.post(
            "/api/chat",
            json={
                "model": self._model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                },
            },
        )
        response.raise_for_status()
        data = response.json()

        return LLMResponse(
            text=data["message"]["content"],
            model=self._model,
            provider="ollama",
            input_tokens=data.get("prompt_eval_count", 0),
            output_tokens=data.get("eval_count", 0),
            cost_usd=0.0,  # Local = free
        )

    async def health_check(self) -> bool:
        try:
            resp = await self._client.get("/api/tags")
            return resp.status_code == 200
        except Exception:
            return False
```

### Example Provider: Gemini LLM (`app/providers/llm/gemini_provider.py`)

```python
"""
Google Gemini LLM provider.

Usage:
    LLM_PROVIDER=gemini
    GEMINI_API_KEY=your-api-key
    GEMINI_MODEL=gemini-2.5-flash
"""

import google.generativeai as genai
from app.providers.base import LLMProvider, LLMResponse
from app.config import settings


class GeminiLLMProvider:
    """LLM provider using Google Gemini API."""

    # Pricing per 1M tokens (USD) — update as prices change
    PRICING = {
        "gemini-2.5-flash": {"input": 0.15, "output": 0.60},
        "gemini-2.5-pro": {"input": 1.25, "output": 10.00},
    }

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
    ):
        self._model_name = model or settings.gemini_model
        genai.configure(api_key=api_key or settings.gemini_api_key)
        self._model = genai.GenerativeModel(self._model_name)

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def model_name(self) -> str:
        return self._model_name

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.1,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt

        response = await self._model.generate_content_async(
            full_prompt,
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            ),
        )

        input_tokens = response.usage_metadata.prompt_token_count
        output_tokens = response.usage_metadata.candidates_token_count
        pricing = self.PRICING.get(self._model_name, {"input": 0.30, "output": 1.20})
        cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000

        return LLMResponse(
            text=response.text,
            model=self._model_name,
            provider="gemini",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost,
        )

    async def health_check(self) -> bool:
        try:
            response = await self._model.generate_content_async("ping")
            return bool(response.text)
        except Exception:
            return False
```

### Provider Factory (`app/providers/llm/factory.py`)

```python
"""
Factory that creates LLM providers from configuration.

The factory reads the LLM_PROVIDER environment variable and
instantiates the corresponding provider class.

To add a new provider:
1. Create a new file: app/providers/llm/your_provider.py
2. Implement the LLMProvider protocol
3. Register it in the PROVIDERS dict below
4. Set LLM_PROVIDER=your_provider in .env.example
"""

from app.providers.base import LLMProvider
from app.config import settings


def create_llm_provider(provider_name: str | None = None) -> LLMProvider:
    """
    Create an LLM provider instance based on config.

    Args:
        provider_name: Override for settings.llm_provider. If None, reads from env.

    Returns:
        An initialized LLMProvider instance.

    Raises:
        ValueError: If the provider name is not recognized.
    """
    name = (provider_name or settings.llm_provider).lower()

    # Lazy imports to avoid loading unused dependencies
    if name == "ollama":
        from app.providers.llm.ollama_provider import OllamaLLMProvider
        return OllamaLLMProvider()

    elif name == "deepseek":
        from app.providers.llm.deepseek_provider import DeepSeekLLMProvider
        return DeepSeekLLMProvider()

    elif name == "gemini":
        from app.providers.llm.gemini_provider import GeminiLLMProvider
        return GeminiLLMProvider()

    elif name == "claude":
        from app.providers.llm.claude_provider import ClaudeLLMProvider
        return ClaudeLLMProvider()

    elif name == "openai":
        from app.providers.llm.openai_provider import OpenAILLMProvider
        return OpenAILLMProvider()

    else:
        available = ["ollama", "deepseek", "gemini", "claude", "openai"]
        raise ValueError(
            f"Unknown LLM provider: '{name}'. "
            f"Available: {available}. "
            f"Set LLM_PROVIDER env var to one of these."
        )
```

### Same pattern for Embedding and Reranker factories — identical structure.

---

## 🔄 Smart LLM Router (`app/services/llm_router.py`)

The router is a **layer above** individual providers. It selects which provider to use
per-query based on complexity + user tier + cost optimization.

```python
"""
Smart LLM Router — routes queries to the cheapest adequate provider.

Routing logic:
    1. Check Redis cache first (saves 40-60% of API calls)
    2. Classify query complexity (0.0 - 1.0)
    3. Route based on complexity + user tier:
        - complexity < 0.2  → Direct DB lookup (no LLM needed)
        - complexity < 0.5  → DeepSeek V3 (cheapest)
        - complexity < 0.8  → Gemini Flash (best Bengali support)
        - complexity >= 0.8 → Claude Sonnet (best reasoning, premium users only)
    4. Fallback chain: Gemini → DeepSeek → Ollama (never show errors to users)
    5. Cache result in Redis (TTL 24h)
    6. Log usage to Kafka for billing

IMPORTANT:
    - In LOCAL DEV mode (LLM_ROUTER_MODE=local), ALL queries go to Ollama.
    - In PRODUCTION mode (LLM_ROUTER_MODE=smart), the routing logic above applies.
    - This is controlled by env var, not code changes.
"""

from app.providers.base import LLMProvider, LLMResponse
from app.providers.llm.factory import create_llm_provider
from app.config import settings


class LLMRouter:
    """Routes queries to the most cost-effective LLM provider."""

    def __init__(self):
        self._mode = settings.llm_router_mode  # "local" or "smart"

        if self._mode == "local":
            # Local dev: everything goes to Ollama
            self._default_provider = create_llm_provider("ollama")
        else:
            # Production: create all providers, route per query
            self._providers: dict[str, LLMProvider] = {}
            for name in settings.llm_router_providers:  # e.g. ["deepseek", "gemini", "claude"]
                try:
                    self._providers[name] = create_llm_provider(name)
                except Exception as e:
                    logger.warning(f"Failed to init LLM provider '{name}': {e}")

            # Fallback: always have Ollama as last resort
            if "ollama" not in self._providers:
                try:
                    self._providers["ollama"] = create_llm_provider("ollama")
                except Exception:
                    pass

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        complexity: float = 0.5,
        user_tier: str = "FREE",
        **kwargs,
    ) -> LLMResponse:
        """Route to the best provider based on complexity and user tier."""

        if self._mode == "local":
            return await self._default_provider.generate(prompt, system_prompt, **kwargs)

        # Smart routing
        provider_name = self._select_provider(complexity, user_tier)
        provider = self._providers.get(provider_name)

        if not provider:
            # Fallback chain
            for fallback in ["gemini", "deepseek", "ollama"]:
                if fallback in self._providers:
                    provider = self._providers[fallback]
                    break

        if not provider:
            raise RuntimeError("No LLM provider available")

        try:
            return await provider.generate(prompt, system_prompt, **kwargs)
        except Exception:
            # Try fallback
            return await self._fallback_generate(prompt, system_prompt, exclude=provider_name, **kwargs)

    def _select_provider(self, complexity: float, user_tier: str) -> str:
        """Select provider based on complexity score and user subscription tier."""
        if complexity < 0.5:
            return "deepseek"
        elif complexity < 0.8 or user_tier in ("FREE", "STUDENT"):
            return "gemini"
        else:
            return "claude"

    async def _fallback_generate(self, prompt, system_prompt, exclude, **kwargs) -> LLMResponse:
        """Try remaining providers in order."""
        fallback_order = ["gemini", "deepseek", "ollama"]
        for name in fallback_order:
            if name == exclude or name not in self._providers:
                continue
            try:
                return await self._providers[name].generate(prompt, system_prompt, **kwargs)
            except Exception:
                continue
        raise RuntimeError("All LLM providers failed")
```

---

## ⚙️ Configuration (`app/config.py`)

```python
"""
All configuration via environment variables.
No hardcoded values. No secrets in code.

To switch ANY provider, change the corresponding env var and restart.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ━━━ Service ━━━
    app_name: str = "dhara-rag"
    debug: bool = False

    # ━━━ Database ━━━
    database_url: str = "postgresql+asyncpg://dhara:password@localhost:5432/dhara"

    # ━━━ Redis ━━━
    redis_url: str = "redis://localhost:6379"

    # ━━━ LLM Provider ━━━
    # Which provider to use for direct LLM calls (when not using router)
    llm_provider: str = "ollama"           # Options: ollama, deepseek, gemini, claude, openai

    # LLM Router mode
    llm_router_mode: str = "local"         # "local" = all Ollama, "smart" = complexity-based routing
    llm_router_providers: list[str] = ["deepseek", "gemini", "claude"]

    # ━━━ Ollama (local) ━━━
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3:14b"        # ← Change this to switch local models

    # ━━━ DeepSeek ━━━
    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-chat"
    deepseek_base_url: str = "https://api.deepseek.com"

    # ━━━ Gemini ━━━
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # ━━━ Claude ━━━
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-20250514"

    # ━━━ OpenAI-compatible ━━━
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str = "https://api.openai.com/v1"

    # ━━━ Embedding Provider ━━━
    embedding_provider: str = "bgem3"      # Options: bgem3, ollama, openai
    embedding_dimension: int = 1024

    # BGE-M3 specific
    bgem3_model_path: str = "BAAI/bge-m3"
    bgem3_use_fp16: bool = True

    # Ollama embedding specific
    ollama_embedding_model: str = "nomic-embed-text"

    # OpenAI embedding specific
    openai_embedding_model: str = "text-embedding-3-small"

    # ━━━ Reranker Provider ━━━
    reranker_provider: str = "bge"         # Options: bge, cohere, noop
    reranker_top_k: int = 5

    # Cohere reranker specific
    cohere_api_key: str = ""
    cohere_rerank_model: str = "rerank-multilingual-v3.0"

    # ━━━ Search ━━━
    search_vector_weight: float = 0.6      # Weight for vector similarity
    search_bm25_weight: float = 0.4        # Weight for BM25 keyword match
    search_top_k: int = 10                 # Final results to return

    # ━━━ Kafka ━━━
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_usage_topic: str = "dhara.usage"

    model_config = {"env_file": ".env.example", "env_file_encoding": "utf-8"}


settings = Settings()
```

---

## 📋 .env.example (Template)

```bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Dhara RAG Service Configuration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Database ──
DATABASE_URL=postgresql+asyncpg://dhara:password@localhost:5432/dhara

# ── Redis ──
REDIS_URL=redis://localhost:6379

# ── LLM Provider ──
# Options: ollama, deepseek, gemini, claude, openai
LLM_PROVIDER=ollama

# ── LLM Router ──
# "local" = all queries to Ollama (dev), "smart" = route by complexity (prod)
LLM_ROUTER_MODE=local
LLM_ROUTER_PROVIDERS=["deepseek", "gemini", "claude"]

# ── Ollama (Local LLM) ──
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:14b
# To switch local models, just change OLLAMA_MODEL:
#   OLLAMA_MODEL=gemma3:12b
#   OLLAMA_MODEL=deepseek-r1:14b
#   OLLAMA_MODEL=llama3.1:8b

# ── DeepSeek API ──
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-chat

# ── Gemini API ──
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

# ── Claude API ──
ANTHROPIC_API_KEY=
CLAUDE_MODEL=claude-sonnet-4-20250514

# ── OpenAI-compatible API ──
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

# ── Embedding Provider ──
# Options: bgem3 (local), ollama, openai
EMBEDDING_PROVIDER=bgem3
EMBEDDING_DIMENSION=1024
BGEM3_MODEL_PATH=BAAI/bge-m3
BGEM3_USE_FP16=true
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# ── Reranker Provider ──
# Options: bge (local), cohere, noop
RERANKER_PROVIDER=bge
RERANKER_TOP_K=5
COHERE_API_KEY=

# ── Search ──
SEARCH_VECTOR_WEIGHT=0.6
SEARCH_BM25_WEIGHT=0.4
SEARCH_TOP_K=10

# ── Kafka ──
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

---

## 🧩 How to Add a New Provider (Step-by-Step)

### Adding a New LLM Provider

```
Step 1: Create file
    → app/providers/llm/your_provider.py

Step 2: Implement the LLMProvider protocol
    → Must have: provider_name, model_name, generate(), health_check()

Step 3: Register in factory
    → Edit app/providers/llm/factory.py
    → Add an elif branch:
        elif name == "your_provider":
            from app.providers.llm.your_provider import YourProvider
            return YourProvider()

Step 4: Add config fields
    → Edit app/config.py → add your_provider_api_key, your_provider_model, etc.

Step 5: Update .env.example
    → Document the new env vars

Step 6: Write tests
    → tests/providers/llm/test_your_provider.py

Step 7: Use it
    → Set LLM_PROVIDER=your_provider in .env
    → Restart. Done.
```

### Adding a New Embedding Provider — same pattern with EmbeddingProvider protocol.
### Adding a New Reranker Provider — same pattern with RerankerProvider protocol.

---

## 🔀 RAG Pipeline (`app/services/rag_pipeline.py`)

```python
"""
Full RAG pipeline: Query → Embed → Search → Rerank → Generate → Cite

This service orchestrates all providers but does NOT depend on any
specific implementation. It only uses the abstract protocols.
"""

class RAGPipeline:
    def __init__(
        self,
        embedding_provider: EmbeddingProvider,
        reranker_provider: RerankerProvider,
        llm_router: LLMRouter,
        search_service: SearchService,
    ):
        self._embedder = embedding_provider
        self._reranker = reranker_provider
        self._llm_router = llm_router
        self._search = search_service

    async def ask(
        self,
        question: str,
        language: str = "bn",
        user_tier: str = "FREE",
        top_k: int = 5,
    ) -> RAGResponse:
        # Step 1: Embed query
        query_embedding = await self._embedder.embed_query(question)

        # Step 2: Hybrid search (vector + BM25)
        raw_results = await self._search.hybrid_search(
            query_embedding=query_embedding.dense_embedding,
            query_text=question,
            top_k=top_k * 4,  # Retrieve more for reranking
        )

        # Step 3: Rerank
        reranked = await self._reranker.rerank(
            query=question,
            documents=[r.text for r in raw_results],
            top_k=top_k,
        )

        # Step 4: Build context from top results
        context = self._build_context(raw_results, reranked)

        # Step 5: Classify complexity for routing
        complexity = self._classify_complexity(question, context)

        # Step 6: Generate answer via LLM router
        prompt = self._build_prompt(question, context, language)
        llm_response = await self._llm_router.generate(
            prompt=prompt,
            system_prompt=DHARA_SYSTEM_PROMPT,
            complexity=complexity,
            user_tier=user_tier,
        )

        # Step 7: Extract citations from answer
        citations = self._extract_citations(llm_response.text, raw_results, reranked)

        return RAGResponse(
            answer=llm_response.text,
            citations=citations,
            llm_provider=llm_response.provider,
            llm_model=llm_response.model,
            tokens_used=llm_response.input_tokens + llm_response.output_tokens,
            cost_usd=llm_response.cost_usd,
        )
```

---

## 🏗️ Dependency Injection (`app/main.py`)

```python
"""
FastAPI application entry point.
Providers are created once at startup and injected into services.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.config import settings
from app.providers.llm.factory import create_llm_provider
from app.providers.embedding.factory import create_embedding_provider
from app.providers.reranker.factory import create_reranker_provider
from app.services.llm_router import LLMRouter
from app.services.search_service import SearchService
from app.services.rag_pipeline import RAGPipeline


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize all providers at startup."""

    # Create providers from config (env vars decide which implementations)
    embedding_provider = create_embedding_provider()
    reranker_provider = create_reranker_provider()
    llm_router = LLMRouter()

    # Create services with injected providers
    search_service = SearchService(embedding_provider=embedding_provider)
    rag_pipeline = RAGPipeline(
        embedding_provider=embedding_provider,
        reranker_provider=reranker_provider,
        llm_router=llm_router,
        search_service=search_service,
    )

    # Store in app state for route access
    app.state.embedding_provider = embedding_provider
    app.state.reranker_provider = reranker_provider
    app.state.llm_router = llm_router
    app.state.search_service = search_service
    app.state.rag_pipeline = rag_pipeline

    yield

    # Cleanup (if needed)


app = FastAPI(
    title="Dhara RAG Service",
    description="AI-powered legal research RAG pipeline for Bangladesh",
    version="0.1.0",
    lifespan=lifespan,
)

# Register routers
from app.routers import search_router, ask_router, embed_router
app.include_router(search_router.router, prefix="/search", tags=["search"])
app.include_router(ask_router.router, prefix="/ask", tags=["ask"])
app.include_router(embed_router.router, prefix="/embed", tags=["embed"])


@app.get("/health")
async def health():
    return {"status": "ok", "providers": {
        "llm": settings.llm_provider,
        "embedding": settings.embedding_provider,
        "reranker": settings.reranker_provider,
        "router_mode": settings.llm_router_mode,
    }}
```

---

## 🧪 Testing

### Test with Mock Providers

```python
"""Create mock providers for unit testing — deterministic, no GPU/API needed."""

class MockLLMProvider:
    provider_name = "mock"
    model_name = "mock-1.0"

    async def generate(self, prompt, system_prompt=None, **kwargs):
        return LLMResponse(
            text="Mock legal answer with [Source 1] citation.",
            model="mock-1.0",
            provider="mock",
            input_tokens=100,
            output_tokens=50,
            cost_usd=0.0,
        )

    async def health_check(self):
        return True


class MockEmbeddingProvider:
    provider_name = "mock"
    model_name = "mock-embed"
    dimension = 1024

    async def embed_texts(self, texts, batch_size=32):
        return [EmbeddingResult(dense_embedding=[0.1] * 1024) for _ in texts]

    async def embed_query(self, query):
        return EmbeddingResult(dense_embedding=[0.1] * 1024)
```

### Running Tests

```bash
cd rag-service
uv run pytest                              # All tests
uv run pytest tests/providers/             # Provider tests only
uv run pytest tests/services/              # Service tests only
uv run pytest -k "test_ollama"             # Specific provider
uv run pytest --cov=app --cov-report=html  # Coverage
```

---

## 🗺️ Codebase Knowledge Graph (RAG Reference)

Use `graphify-out/` at the project root as a fast lookup index before reading RAG service files cold.

**RAG service-relevant communities in `graphify-out/GRAPH_REPORT.md`:**
- **Community 2 — RAG Ask Pipeline:** `AskRequest`, `AskResponse`, `Citation`, `RAGResponse`, `EmbeddingProvider`, `RerankerProvider`, ask router, RAG pipeline — the core request flow
- **Community 3 — Provider Abstraction Protocols:** `LLMResponse` (21 edges — most connected node in entire graph), `EmbeddingResult`, `RerankResult`, `BGERerankerProvider`, `CohereRerankerProvider`, all factories — the full provider layer

**God nodes in this service** (most cross-connected — touch these carefully):
| Node | Edges | Why it matters |
|------|-------|---------------|
| `LLMResponse` | 21 | Return type for ALL LLM providers — changing it breaks every provider |
| `RerankResult` | 15 | Return type for ALL rerankers |
| `Factory for creating reranker providers.` | 15 | Central wiring point |
| `RAGPipeline` | 15 | Orchestrates all providers — most complex service |
| `EmbeddingResult` | 13 | Return type for ALL embedding providers |
| `LLMRouter` | 12 | Routes queries across providers — key production logic |

**Hyperedges to know** (multi-file relationships):
- `RAG Provider Abstraction System` — `llm_provider_protocol`, `embedding_provider_protocol`, `reranker_provider_protocol` + all factories (all must stay in sync)
- `RAG Pipeline Orchestration` — `rag_pipeline → search_service → llm_router → embedding_provider_protocol`

**How to query:**
- `graphify-out/graph.json` → filter edges by `source` path prefix `rag-service\\` to scope to this service
- Search `label` field for a class name (e.g. `LLMRouter`, `BGERerankerProvider`) to find its node and all connected edges
- `manifest.json` → check timestamps against current file mtimes to detect if graph is stale

> **Staleness note:** If you add or modify a provider, run `/graphify` to rebuild — otherwise the graph won't reflect the new node connections.

---

## ⚠️ Common Pitfalls

1. **BGE-M3 + LLM GPU conflict** — Don't load both on GPU simultaneously (16GB VRAM limit). Options:
   - Batch embed offline (GPU) → then serve LLM (GPU)
   - Run embeddings on CPU (`BGEM3_USE_FP16=false`) while LLM uses GPU
   - Use Ollama for embeddings (`EMBEDDING_PROVIDER=ollama`) which manages VRAM itself
2. **LangChain 0.3.x** — Use LCEL patterns. Import from `langchain-core`, not `langchain`.
3. **Ollama cold start** — First request after loading a model is slow. Send a warmup request in lifespan.
4. **Async everywhere** — All FastAPI endpoints and provider methods must be `async def`.
5. **Provider initialization** — Create providers once in lifespan, not per-request.
6. **Bengali tokenization** — BGE-M3 handles Bengali natively. Don't pre-tokenize.
7. **Vector dimension mismatch** — If you switch embedding providers, vector dimensions may change. Run re-embedding.
8. **API rate limits** — DeepSeek/Gemini have rate limits. Implement exponential backoff in providers.


## Important Notes:
- Memory Updates(THIS FILE): This file is my persistent memory. Always update this file with new knowledge, insights, lessons learned, and, or context gained  during our conversations -
  even if I don't explicitly ask you to. The only time you should NOT update it is if I explicitly tell you not to. Condense new information into the appropriate section, or create a new section if needed.Keep it organized and non-redundant.
