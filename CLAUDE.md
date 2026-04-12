# CLAUDE.md — ধারা (Dhara): AI-Powered Legal Research for Bangladesh

> **This file is the single source of truth for Claude Code.**
> Read it fully before writing any code. Follow every convention strictly.

---

## 📌 Project Overview

**Dhara** (ধারা) is an AI-powered legal research platform for Bangladeshi lawyers and law students. It provides natural language search (Bangla + English) across statutes, case law, and SROs with AI-generated answers backed by real citations.

### Architecture: 3 Services + Infrastructure

```
dhara/
├── backend/          → Spring Boot 3.x (Java 21) — API gateway, auth, search proxy, subscriptions
├── rag-service/      → Python FastAPI — RAG pipeline, embeddings, LLM routing, re-ranking
├── frontend/         → Next.js 15 (TypeScript + Tailwind) — SSR web app
├── data-pipeline/    → Python scrapers & parsers (scrapy, pymupdf, Tesseract OCR)
├── infra/            → Nginx, Docker, monitoring configs
└── docs/             → Schema, API docs, architecture diagrams
```

### Service Communication

```
Next.js ──(REST/HTTPS)──→ Spring Boot ──(gRPC)──→ Python RAG Service
                              │                         │
                              ├── PostgreSQL+pgvector    ├── Embedding Provider (pluggable)
                              ├── Redis                  ├── LLM Provider (pluggable)
                              ├── MinIO                  └── Reranker Provider (pluggable)
                              └── Kafka
```

---

## 🔧 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend API | Spring Boot | 3.x (Java 21, Gradle) |
| RAG Service | Python + FastAPI | 3.11+ |
| Frontend | Next.js + TypeScript + Tailwind | 15.x |
| Database | PostgreSQL + pgvector | 16 |
| Cache | Redis | 7 |
| Object Storage | MinIO | latest |
| Message Queue | Kafka (KRaft mode) | latest |
| Local LLM | Ollama | latest |
| Embeddings | BGE-M3 (default, pluggable) | BAAI/bge-m3 |
| Re-ranker | bge-reranker-v2-m3 (pluggable) | BAAI/bge-reranker-v2-m3 |
| Auth | Spring Security + JWT | — |
| Payment | SSLCommerz | — |
| Dev Tool | Claude Code | — |

---

## 🏗️ Critical Architecture Principle: Provider Abstraction

> **THE MOST IMPORTANT DESIGN RULE IN THIS PROJECT.**
> Every AI component (LLM, Embedding, Reranker) MUST be behind an abstract interface.
> Switching from local Ollama to a remote API (or between remote APIs) must require
> ZERO code changes — only a config/env change.

### How This Works

```
┌─────────────────────────────────────────────────────┐
│              Provider Abstraction Layer              │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ LLMProvider  │  │EmbedProvider │  │ Reranker  │ │
│  │  (Protocol)  │  │  (Protocol)  │  │(Protocol) │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                 │                │        │
│    ┌────┴────┐       ┌────┴────┐      ┌────┴────┐  │
│    │ Ollama  │       │ BGE-M3  │      │BGE-Rer. │  │
│    │ DeepSeek│       │ OpenAI  │      │Cohere   │  │
│    │ Gemini  │       │ Cohere  │      │ Local   │  │
│    │ Claude  │       │ Ollama  │      └─────────┘  │
│    │ OpenAI  │       └─────────┘                   │
│    └─────────┘                                     │
└─────────────────────────────────────────────────────┘

Config switches provider — code never changes.
```

See `rag-service/CLAUDE.md` for implementation details.

---

## 📁 Full Project Structure

```
dhara/
├── CLAUDE.md                              ← YOU ARE HERE
├── docker-compose.yml                     # Local dev: PG+pgvector, Redis, MinIO, Kafka
├── docker-compose.prod.yml                # Production overrides
├── .env.example                           # All env vars documented
├── README.md
│
├── backend/                               # ━━━ Spring Boot API ━━━
│   ├── CLAUDE.md                          # Backend-specific instructions
│   ├── build.gradle
│   ├── src/main/java/com/dhara/
│   │   ├── DharaApplication.java
│   │   ├── config/                        # SecurityConfig, RedisConfig, KafkaConfig, GrpcConfig
│   │   ├── auth/                          # AuthController, JwtService, UserService
│   │   ├── search/                        # SearchController, SearchService (gRPC to RAG)
│   │   ├── legal/                         # StatuteController, JudgmentController, SroController
│   │   ├── subscription/                  # PlanController, PaymentController, SslCommerzWebhook
│   │   ├── entity/                        # JPA entities: Statute, Section, Judgment, User, etc.
│   │   ├── repository/                    # Spring Data JPA repositories
│   │   ├── ratelimit/                     # RedisRateLimiter
│   │   ├── grpc/                          # gRPC client stubs for RAG service
│   │   └── common/                        # ApiResponse<T>, exceptions, utils
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   ├── application-prod.yml
│   │   └── db/migration/                  # Flyway V1__, V2__, ...
│   ├── src/test/
│   └── Dockerfile
│
├── rag-service/                           # ━━━ Python RAG Pipeline ━━━
│   ├── CLAUDE.md                          # RAG-specific instructions (MODEL ABSTRACTION details)
│   ├── pyproject.toml
│   ├── app/
│   │   ├── main.py                        # FastAPI app entry
│   │   ├── config.py                      # Settings via pydantic-settings (env-driven)
│   │   ├── routers/
│   │   │   ├── search_router.py           # POST /search — hybrid search
│   │   │   ├── ask_router.py              # POST /ask — full RAG Q&A
│   │   │   └── embed_router.py            # POST /embed — generate embeddings
│   │   ├── providers/                     # ★ PROVIDER ABSTRACTION LAYER ★
│   │   │   ├── __init__.py
│   │   │   ├── base.py                    # Abstract protocols: LLMProvider, EmbeddingProvider, RerankerProvider
│   │   │   ├── llm/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── ollama_provider.py     # Local Ollama (any model)
│   │   │   │   ├── deepseek_provider.py   # DeepSeek API
│   │   │   │   ├── gemini_provider.py     # Google Gemini API
│   │   │   │   ├── claude_provider.py     # Anthropic Claude API
│   │   │   │   ├── openai_provider.py     # OpenAI-compatible API
│   │   │   │   └── factory.py             # LLMProviderFactory — creates from config
│   │   │   ├── embedding/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── bgem3_provider.py      # Local BGE-M3 via FlagEmbedding
│   │   │   │   ├── ollama_provider.py     # Ollama embeddings (nomic, etc.)
│   │   │   │   ├── openai_provider.py     # OpenAI embedding API
│   │   │   │   └── factory.py             # EmbeddingProviderFactory
│   │   │   └── reranker/
│   │   │       ├── __init__.py
│   │   │       ├── bge_reranker.py        # Local bge-reranker-v2-m3
│   │   │       ├── cohere_reranker.py     # Cohere Rerank API
│   │   │       └── factory.py             # RerankerProviderFactory
│   │   ├── services/
│   │   │   ├── search_service.py          # Hybrid vector + BM25 search
│   │   │   ├── rag_pipeline.py            # Full RAG chain (retrieve → rerank → generate)
│   │   │   └── llm_router.py              # Smart routing (complexity-based, tier-based)
│   │   ├── prompts/                       # Jinja2/string legal prompt templates
│   │   │   ├── legal_qa.py
│   │   │   ├── case_summary.py
│   │   │   └── case_comparison.py
│   │   └── models/                        # Pydantic request/response schemas
│   │       ├── search.py
│   │       ├── ask.py
│   │       └── common.py
│   ├── proto/                             # gRPC .proto definitions
│   │   └── rag_service.proto
│   ├── scripts/
│   │   ├── embed_all_documents.py         # Batch embedding pipeline
│   │   └── evaluate_rag.py               # RAG quality eval (50 test questions)
│   ├── tests/
│   └── Dockerfile
│
├── data-pipeline/                         # ━━━ Scrapers & Parsers ━━━
│   ├── scrapers/
│   │   ├── bdlaws_spider.py               # bdlaws.minlaw.gov.bd
│   │   ├── supremecourt_spider.py         # supremecourt.gov.bd
│   │   └── gazette_spider.py              # Bangladesh Gazette SROs
│   ├── parsers/
│   │   ├── statute_parser.py              # Act → sections splitting
│   │   ├── judgment_parser.py             # Case name, bench, citations extraction
│   │   └── citation_linker.py             # Cross-reference builder
│   ├── loaders/
│   │   ├── db_loader.py                   # Insert parsed data into PostgreSQL
│   │   └── ocr_pipeline.py               # Bengali OCR (Tesseract ben+eng)
│   └── scrapy.cfg
│
├── frontend/                              # ━━━ Next.js Web App ━━━
│   ├── CLAUDE.md                          # Frontend-specific instructions
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── app/
│   │   ├── layout.tsx                     # Root layout + providers
│   │   ├── page.tsx                       # Landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── search/page.tsx                # ★ Core feature — legal search
│   │   ├── ask/page.tsx                   # AI Q&A chat interface
│   │   ├── statutes/
│   │   │   ├── page.tsx                   # Browse all Acts
│   │   │   └── [id]/page.tsx              # Single statute + sections
│   │   ├── judgments/
│   │   │   ├── page.tsx                   # Browse judgments
│   │   │   └── [id]/page.tsx              # Single judgment viewer
│   │   └── pricing/page.tsx               # Subscription plans
│   ├── components/
│   │   ├── search/                        # SearchBar, ResultCard, FilterPanel
│   │   ├── chat/                          # ChatInterface, MessageBubble, CitationLink
│   │   ├── legal/                         # StatuteViewer, JudgmentViewer, SectionNav
│   │   ├── layout/                        # Header, Footer, Sidebar, LanguageToggle
│   │   └── ui/                            # Button, Card, Modal, Loading (shared primitives)
│   ├── lib/
│   │   ├── api.ts                         # Axios/fetch client to backend
│   │   ├── auth.ts                        # JWT token management
│   │   └── i18n.ts                        # next-intl config
│   ├── messages/
│   │   ├── en.json                        # English translations
│   │   └── bn.json                        # Bengali translations
│   └── Dockerfile
│
├── infra/
│   ├── nginx/nginx.conf                   # Reverse proxy config
│   └── monitoring/                        # Prometheus, Grafana, Uptime Kuma configs
│
└── docs/
    ├── schema.md                          # Full DB schema reference
    ├── api.md                             # REST API documentation
    ├── architecture.md                    # System architecture diagrams
    └── provider-guide.md                  # How to add new LLM/Embedding/Reranker providers
```

---

## 💻 Code Conventions

### Java (Backend)

- **Style:** Google Java Style Guide
- **Java version:** 21 (use records, sealed classes, pattern matching where appropriate)
- **Annotations:** `@MockitoBean` (NOT `@MockBean` — Spring Boot 3.4+)
- **DTOs:** Use Java records for request/response DTOs
- **API response wrapper:** Always return `ApiResponse<T>`:
  ```java
  public record ApiResponse<T>(boolean success, T data, String error) {
      public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(true, data, null); }
      public static <T> ApiResponse<T> fail(String error) { return new ApiResponse<>(false, null, error); }
  }
  ```
- **Exception handling:** Global `@RestControllerAdvice` with proper HTTP status codes
- **Database:** Flyway migrations only (never JPA auto-DDL). Prefix: `V{number}__{description}.sql`
- **Config:** `application.yml` with profiles: `dev`, `prod`. Never hardcode values.

### Python (RAG Service)

- **Style:** PEP 8, type hints on ALL functions and methods
- **Async:** All FastAPI endpoints must be `async def`
- **Config:** `pydantic-settings` reading from environment variables
- **Provider pattern:** All AI providers implement abstract `Protocol` classes (see rag-service/CLAUDE.md)
- **Error handling:** Custom exceptions → FastAPI exception handlers → JSON error responses
- **Dependencies:** `pyproject.toml` with `uv` for package management

### TypeScript (Frontend)

- **Strict mode:** `"strict": true` in tsconfig.json
- **Components:** Functional components only, React Server Components where possible
- **Interfaces over types:** Use `interface` for object shapes
- **i18n:** All user-facing strings through `next-intl` (never hardcode Bengali or English text)
- **API client:** Centralized in `lib/api.ts` with proper error handling
- **Styling:** Tailwind CSS utility classes (no custom CSS files except globals.css)

### All Services

- **Environment variables:** Never hardcode secrets. Use `.env` files locally, Docker secrets in prod.
- **Logging:** Structured JSON logs in production
- **Health checks:** Every service exposes `/health` endpoint
- **Docker:** Each service has its own `Dockerfile` with multi-stage builds

---

## 🗄️ Database Conventions

- **Engine:** PostgreSQL 16 with pgvector extension
- **Migrations:** Flyway (backend manages all migrations)
- **Naming:** `snake_case` for tables and columns, no schema prefix
- **Timestamps:** Always `TIMESTAMPTZ`, default `NOW()`
- **Soft deletes:** Use `status` column (ACTIVE/DELETED), not hard deletes
- **Embeddings:** `vector(1024)` columns for BGE-M3 output
- **Indexes:** HNSW for vector similarity (`vector_cosine_ops`), GIN for full-text search

---

## 🔒 Security Rules

1. **Never hardcode API keys** — all keys in `.env`, loaded via config classes
2. **JWT tokens** — short-lived access (15min), refresh tokens (7d) in httpOnly cookies
3. **Rate limiting** — Redis-based per user tier (Free=5/day, Student=30/day, Pro=unlimited)
4. **Input sanitization** — validate all user input before DB or LLM calls
5. **CORS** — whitelist frontend domain only
6. **Bengali SQL injection** — test with Bengali input specifically
7. **LLM prompt injection** — sanitize user queries before embedding in prompts

---

## 🧪 Testing Conventions

| Service | Framework | Command |
|---------|-----------|---------|
| Backend | JUnit 5 + Mockito | `./gradlew test` |
| RAG Service | pytest + pytest-asyncio | `uv run pytest` |
| Frontend | Vitest + React Testing Library | `npm test` |

- **Backend:** Unit tests for services, integration tests for controllers (use `@SpringBootTest` sparingly)
- **RAG Service:** Unit tests for each provider, integration tests for RAG pipeline
- **Frontend:** Component tests for interactive elements, snapshot tests for static pages
- **RAG Quality:** `scripts/evaluate_rag.py` with 50 Bengali+English legal test questions

---

## 🐳 Docker Compose (Local Dev)

```yaml
# Key services and their ports:
# PostgreSQL+pgvector  → localhost:5432
# Redis                → localhost:6379
# MinIO                → localhost:9000 (console: 9001)
# Kafka (KRaft)        → localhost:9092
# Spring Boot API      → localhost:8080
# Python RAG Service   → localhost:8000
# Next.js Frontend     → localhost:3000
# Ollama               → localhost:11434 (runs natively, NOT in Docker)
```

> **Ollama runs natively** on the host (not in Docker) to access GPU directly.
> RAG service connects to Ollama via `OLLAMA_BASE_URL=http://host.docker.internal:11434`
> or `http://localhost:11434` if RAG service also runs natively during dev.

---

## 🌐 i18n (Internationalization)

- **Languages:** Bengali (bn) — primary, English (en) — secondary
- **Library:** `next-intl` for frontend
- **Backend:** Error messages have both `message_en` and `message_bn`
- **LLM responses:** Match user's query language (detected in RAG service)
- **Legal terms:** Maintain a Bengali ↔ English legal glossary in `docs/glossary.json`

---

## 🚀 Deployment

### Local Development
```bash
docker compose up -d          # Start infra (PG, Redis, MinIO, Kafka)
ollama serve                  # Start Ollama (native, for GPU access)
cd backend && ./gradlew bootRun
cd rag-service && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

### Production (Single VPS)
```
Cloudflare CDN → Nginx → Spring Boot (:8080)
                       → Next.js SSR (:3000) or Vercel
                       → Python RAG (:8000) via gRPC from Spring Boot
```

---

## ⚠️ Common Pitfalls — Read Before Coding

1. **Flyway checksum mismatch** — Never edit an existing migration. Create a new one.
2. **gRPC port conflicts in tests** — Use `@DynamicPropertySource` for random ports
3. **Kafka Alpine + snappy** — Use `lz4` compression, not snappy (Alpine incompatibility)
4. **BGE-M3 + LLM GPU conflict** — Don't run both simultaneously on 16GB VRAM. Use CPU for embeddings during LLM serving, or batch embed offline.
5. **Spring Boot 3.4+ MockBean** — Use `@MockitoBean`, not `@MockBean`
6. **LangChain 0.3.x** — LCEL patterns, use `langchain-core` not `langchain` for base classes
7. **Next.js App Router** — Server Components by default, `"use client"` only when needed
8. **Bengali text in PostgreSQL** — Ensure UTF-8 encoding, test with actual Bengali strings

---

## 🗺️ Codebase Knowledge Graph (RAG Reference)

A pre-built knowledge graph of the entire Dhara codebase lives at:

```
graphify-out/
├── graph.json          # Structured knowledge graph — 586 nodes, 750 edges, 52 communities
├── graph.html          # Interactive visual explorer (open in browser)
├── GRAPH_REPORT.md     # Summary: god nodes, communities, surprising connections
├── manifest.json       # File index with last-modified timestamps (use to check staleness)
├── cache/              # Raw extraction cache per file
└── cost.json           # Token cost metadata
```

**When to use it:**
- Before exploring the codebase cold — read `GRAPH_REPORT.md` first for the architectural overview
- To find which files are related to a concept (e.g. `RagServiceClient`, `LLMRouter`, `ApiResponse`)
- To understand inter-service dependencies without reading every file
- To identify god nodes (most-connected abstractions) before making broad changes

**How to query it:**
- `graph.json` → search by `label`, `community`, or `source`/`target` edge fields
- `manifest.json` → check if a file has changed since the graph was built (compare timestamps)
- `GRAPH_REPORT.md` → read communities section to find which files cluster together

**Key communities in the graph:**
| Community | Topic | Key Nodes |
|-----------|-------|-----------|
| 0 | Frontend API Client | `ApiClient`, `ApiError` |
| 1 | Project Architecture & Docs | Spring Boot, RAG service, Dhara overview |
| 2 | RAG Ask Pipeline | `AskRequest`, `RAGResponse`, `EmbeddingProvider` |
| 3 | Provider Abstraction | `LLMResponse`, `EmbeddingResult`, `RerankResult`, all factories |
| 4 | Payment & Legal CRUD | `PaymentController`, `Statute`, `Section`, `StatuteRepository` |

> **Staleness note:** The graph was built from a snapshot. If `manifest.json` timestamps differ from current file mtimes, re-run `/graphify` to rebuild.

---

## 📋 Development Workflow with Claude Code

```bash
cd ~/projects/dhara
claude

# Example workflow for a feature:
# 1. Ask Claude to create the migration
# 2. Ask Claude to create the entity + repository
# 3. Ask Claude to create the service + controller
# 4. Ask Claude to write tests
# 5. Run tests, fix issues
# 6. Commit
```

### Prompt Tips for Claude Code

- Always reference this CLAUDE.md: "Follow the CLAUDE.md conventions"
- Be specific about which service: "In rag-service, create..."
- Reference the provider pattern: "Implement as a new provider following the provider abstraction"
- Ask for tests alongside code: "Create X with unit tests"


## Important Notes:
- Memory Updates(THIS FILE): This file is my persistent memory. Always update this file with new knowledge, insights, lessons learned, and, or context gained  during our conversations -
  even if I don't explicitly ask you to. The only time you should NOT update it is if I explicitly tell you not to. Condense new information into the appropriate section, or create a new section if needed.Keep it organized and non-redundant.
