# Project Proposal
# ধারা (Dhara) — AI-Powered Legal Research Platform for Bangladesh

---

## Executive Summary

**Dhara** (ধারা, meaning "flow" or "stream" in Bengali) is a full-stack AI-powered legal research platform purpose-built for the Bangladeshi legal ecosystem. It enables lawyers, law students, and legal professionals to search statutes, case law, and statutory regulatory orders (SROs) using natural language in both Bengali and English, and receive AI-generated answers backed by real, verifiable citations.

Bangladesh's legal system suffers from a critical access problem: tens of thousands of statutes, Supreme Court judgments, and gazette notifications are scattered across disconnected, poorly indexed government websites with no semantic search capability and almost no support for the Bengali language. Dhara solves this by combining Retrieval-Augmented Generation (RAG), multilingual embeddings, and a fully abstracted AI provider layer into a production-grade SaaS platform.

---

## Problem Statement

| Pain Point | Current Reality |
|---|---|
| Legal research is manual and slow | Lawyers spend hours searching PDFs and physical libraries |
| No natural language search | Government portals support keyword-only search |
| Bengali language ignored | Almost all digital legal tools are English-only |
| Citations are unverified | No system links an AI answer back to a real statute or judgment |
| Access is unequal | Junior lawyers and law students lack access to premium tools |
| AI hallucination risk | Generic LLMs confidently cite laws that do not exist |

Dhara addresses every one of these problems with a purpose-built, citation-first RAG architecture.

---

## Project Architecture

Dhara is composed of three independently deployable services plus a shared data infrastructure layer.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│              Next.js 15 (TypeScript + Tailwind)                 │
│         Bengali + English UI · SSR · next-intl i18n            │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS / REST
┌─────────────────────────▼───────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│              Spring Boot 3.x (Java 21, Gradle)                  │
│  Auth · Rate Limiting · Subscription · Legal CRUD · Export      │
│  Kafka (usage events) · Redis (cache + rate limits)             │
└──────┬──────────────────┬──────────────────────────────────────┘
       │ gRPC             │ SQL (Flyway)
       │          ┌───────▼──────────────┐
       │          │  PostgreSQL 16        │
       │          │  + pgvector           │
       │          │  + MinIO (S3)         │
       │          └───────────────────────┘
┌──────▼───────────────────────────────────────────────────────────┐
│                       RAG SERVICE LAYER                          │
│               Python FastAPI (async, pydantic-settings)          │
│                                                                  │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────┐ │
│  │ LLMProvider  │  │EmbeddingProvider│  │  RerankerProvider    │ │
│  │  (Protocol)  │  │  (Protocol)     │  │  (Protocol)          │ │
│  ├──────────────┤  ├────────────────┤  ├──────────────────────┤ │
│  │ Ollama       │  │ BGE-M3 (local) │  │ BGE Reranker (local) │ │
│  │ DeepSeek     │  │ OpenAI Embed   │  │ Cohere Rerank        │ │
│  │ Gemini       │  │ Ollama Embed   │  │ No-op (bypass)       │ │
│  │ Claude       │  └────────────────┘  └──────────────────────┘ │
│  │ OpenAI       │                                                │
│  └──────────────┘                                                │
│  RAGPipeline · HybridSearch · LLMRouter · Prompt Templates      │
└──────────────────────────────────────────────────────────────────┘
```

### Service Breakdown

#### 1. Backend — Spring Boot 3.x (Java 21)
The API gateway and business logic layer. Handles all client-facing requests, authentication, authorization, rate limiting, and subscription management. Communicates with the RAG service over gRPC for AI queries.

**Key responsibilities:**
- JWT-based authentication (15-minute access tokens, 7-day refresh tokens in httpOnly cookies)
- Per-user tier rate limiting via Redis (Free: 5 queries/day, Student: 30/day, Pro: unlimited)
- Legal content CRUD: statutes, sections, judgments, SROs
- User document management: create, edit, share, export
- Subscription lifecycle with SSLCommerz payment gateway
- Kafka-based usage event streaming for analytics and billing
- Flyway database migrations

#### 2. RAG Service — Python FastAPI
The AI intelligence layer. Implements the full Retrieval-Augmented Generation pipeline from query to cited answer. Every AI component is behind a pluggable `Protocol` interface so switching providers requires only a config change — zero code changes.

**Key responsibilities:**
- Hybrid vector + BM25 full-text search against pgvector
- BGE-M3 multilingual embeddings (1024-dimensional, Bengali + English)
- bge-reranker-v2-m3 cross-encoder reranking
- Smart LLM routing: routes simple queries to fast/cheap models, complex legal analysis to capable models
- Structured legal prompt templates for Q&A, case summary, and case comparison
- RAG quality evaluation suite (50 Bengali + English test questions)
- gRPC server for Spring Boot integration

#### 3. Frontend — Next.js 15 (TypeScript + Tailwind)
The user-facing web application. Uses React Server Components by default, Bengali as the primary language via next-intl, and a navy/gold/green design system reflecting the colors of Bangladeshi legal tradition.

**Key responsibilities:**
- Natural language search interface (Bengali + English)
- AI Q&A chat interface with inline citation display
- Statute and judgment browser with section-level navigation
- Document editor with rich text, auto-save, and PDF/DOCX/TXT export
- Legal document template library (50+ templates)
- Document analysis: upload, query, and verify arbitrary legal documents
- Subscription and pricing pages with SSLCommerz payment flow

#### 4. Data Pipeline — Python (Scrapy + PyMuPDF + Tesseract)
The ingestion layer that populates the database from Bangladeshi government sources.

**Key responsibilities:**
- Web scraping: bdlaws.minlaw.gov.bd (statutes), supremecourt.gov.bd (judgments), Bangladesh Gazette (SROs)
- PDF parsing: statute/section splitting, judgment metadata extraction
- Bengali OCR: Tesseract with `ben+eng` language pack for scanned documents
- Citation linking: cross-reference builder between judgments and statutes
- Batch embedding pipeline: embeds all ingested documents into pgvector

---

## Feature Set

### Core Features (Implemented)

#### Legal Search
- Hybrid search combining dense vector similarity (BGE-M3) and sparse BM25 lexical matching
- Natural language queries in Bengali or English
- Filter by content type (statutes, judgments, SROs), date range, court, and topic area
- Section-level granularity for statute retrieval

#### AI Q&A (RAG)
- Full RAG pipeline: retrieve → rerank → generate
- Every answer includes structured citations linking back to the exact statute section or judgment paragraph
- Bilingual responses: answer language matches query language (auto-detected)
- Smart LLM routing: simple lookups go to fast models; complex multi-document analysis goes to capable models

#### Legal Content Browser
- Browse and read all ingested Acts of Bangladesh with section navigation
- Supreme Court judgment viewer with bench, citation, and outcome metadata
- SRO browser with gazette reference links

#### Document Management
- Rich text editor with auto-save for user-authored legal documents
- Export to PDF (openhtmltopdf), DOCX (Apache POI), and plain text
- Document sharing with read-only links
- Document statistics dashboard (word count, creation date, recent activity)

#### Legal Document Templates
- Library of 50+ pre-drafted Bangladeshi legal document templates
- Categories: contracts, affidavits, petitions, plaints, deeds, company resolutions
- One-click copy to document editor for customization

#### Document Analysis
- Upload arbitrary PDFs or images for AI-powered analysis
- Query uploaded documents with natural language in Bengali or English
- Cross-reference uploaded documents against the legal knowledge base
- Verify citations and legal claims found in uploaded documents

#### Authentication and Accounts
- Email/password registration and login
- JWT-based stateless auth with secure refresh token rotation
- Role-based access: Free, Student, Pro tiers

#### Subscription and Billing
- Three-tier pricing: Free, Student, Pro
- SSLCommerz integration for Bangladeshi payment methods (bKash, Nagad, cards, net banking)
- Automated tier enforcement via Redis rate limiting

### Infrastructure Features

| Feature | Implementation |
|---|---|
| Caching | Redis 7 — auth tokens, rate limit counters, search result caching |
| Object Storage | MinIO — uploaded documents, exported files |
| Message Queue | Kafka KRaft — usage events, async billing triggers |
| Local LLM | Ollama (runs natively on host for GPU access) |
| Reverse Proxy | Nginx — TLS termination, service routing |
| Monitoring | Prometheus + Grafana + Uptime Kuma |

---

## Detailed Workflow

### Workflow 1: Natural Language Legal Search

```
User types query (Bengali or English)
        │
        ▼
Next.js SearchBar → POST /api/search (Spring Boot)
        │
        ▼
Spring Boot SearchController
  → check JWT (JwtAuthFilter)
  → check rate limit (RedisRateLimiter)
  → forward via gRPC to RAG service
        │
        ▼
RAG Service SearchService
  → embed query (EmbeddingProvider: BGE-M3)
  → vector similarity search (pgvector HNSW, cosine)
  → BM25 full-text search (PostgreSQL GIN index)
  → merge and deduplicate results (Reciprocal Rank Fusion)
  → rerank top-N candidates (RerankerProvider: BGE Reranker)
  → return ranked results with source metadata
        │
        ▼
Spring Boot → return SearchResponse (statute/judgment/SRO cards)
        │
        ▼
Next.js renders SearchResults with citation links
```

### Workflow 2: AI Q&A (Full RAG Pipeline)

```
User asks legal question in Bengali or English
        │
        ▼
POST /api/ask (Spring Boot)
  → auth check → rate limit check
  → gRPC AskRequest to RAG service
        │
        ▼
RAG Service AskRouter → RAGPipeline
  1. Embed the query
  2. Hybrid search (vector + BM25) → top-20 candidates
  3. Cross-encoder rerank → top-5 passages
  4. LLMRouter: select model based on query complexity + user tier
  5. Inject passages into legal QA prompt template
  6. Stream LLM response
  7. Parse citations from response, link to DB records
        │
        ▼
Structured AskResponse:
  {
    answer: "...",
    citations: [{ statute_id, section, text_snippet, confidence }],
    model_used: "...",
    language: "bn"
  }
        │
        ▼
Next.js AskPage renders answer with inline CitationLink components
  → each citation links to full statute or judgment viewer
```

### Workflow 3: Document Upload and Analysis

```
User uploads PDF/image on /analysis page
        │
        ▼
POST /api/analysis/upload (Spring Boot)
  → store file in MinIO
  → create AnalysisSession record in PostgreSQL
  → OCR if image (Tesseract ben+eng)
  → extract text, chunk, embed (EmbeddingProvider)
  → store chunks with session_id in document_chunks table
        │
        ▼
User queries the uploaded document
        │
        ▼
POST /api/analysis/query (Spring Boot)
  → load session
  → hybrid search over session-scoped chunks
  → RAG pipeline (same as Workflow 2, session-scoped context)
  → return answer with citations pointing to uploaded document pages
```

### Workflow 4: Document Authoring and Export

```
User opens /documents — sees their document list
        │
        ▼
Click "New Document" or select template from /templates
        │
        ▼
Rich text editor loads in /documents/[id]
  → auto-saves every 30 seconds (PATCH /api/documents/{id})
  → Redis caches last-saved version for conflict detection
        │
        ▼
User clicks Export
  → choose PDF / DOCX / TXT
  → POST /api/documents/{id}/export
  → Spring Boot DocumentService:
      PDF → openhtmltopdf-pdfbox (renders HTML to PDF)
      DOCX → Apache POI OOXML
      TXT → strip HTML, Unicode-safe Bengali text
  → file streamed back to browser
```

### Workflow 5: Subscription and Payment

```
User visits /pricing → selects plan
        │
        ▼
POST /api/payment/initiate
  → Spring Boot PaymentController
  → SSLCommerz payment initiation API
  → returns payment URL
        │
        ▼
User completes payment on SSLCommerz gateway
(bKash / Nagad / card / net banking)
        │
        ▼
SSLCommerz webhook → POST /api/payment/webhook
  → SslCommerzWebhookController validates IPN signature
  → SslCommerzService activates UserSubscription
  → Kafka event: UsageEvent(SUBSCRIPTION_ACTIVATED)
  → Redis rate limit counters reset to new tier limits
```

---

## Technology Decisions and Rationale

### Why Spring Boot for the API Gateway?
Spring Boot's mature ecosystem provides battle-tested JWT security, Flyway migrations, gRPC client integration, and Kafka producers with minimal boilerplate. Java 21's virtual threads (via Project Loom) handle high-concurrency I/O workloads (many simultaneous search requests) efficiently without async complexity.

### Why Python FastAPI for the RAG Service?
Python owns the AI/ML ecosystem. Every embedding library (FlagEmbedding for BGE-M3), reranker (FlagReranker), and LLM client (anthropic, openai, google-generativeai) has first-class Python support. FastAPI's async model pairs naturally with LLM streaming. Separating the RAG service from the Spring Boot backend also means the AI layer can be scaled, replaced, or upgraded independently.

### Why BGE-M3 for Embeddings?
BGE-M3 (BAAI/bge-m3) is a 1024-dimensional multilingual embedding model with strong Bengali language support — a non-negotiable requirement. It outperforms OpenAI's `text-embedding-ada-002` on Bengali semantic similarity benchmarks and can run locally on a consumer GPU, keeping costs near zero during development.

### Why the Provider Abstraction Pattern?
The AI landscape changes rapidly. A hard dependency on any single LLM, embedding model, or reranker would create expensive rewrites when better options emerge (or when providers change pricing). The `Protocol`-based abstraction (Python structural typing) means adding a new provider is a single file addition and a config change — the rest of the system never changes.

### Why pgvector Instead of a Dedicated Vector DB?
pgvector keeps the stack simple: one database for both relational data (statutes, users, subscriptions) and vector embeddings. PostgreSQL's HNSW index provides competitive ANN query performance. Avoiding a separate Pinecone/Weaviate/Qdrant instance reduces operational complexity and cost — especially important for a single-VPS deployment.

---

## Data Model Overview

```
statutes           → id, title, year, category, full_text, embedding (vector 1024)
sections           → id, statute_id, number, title, content, embedding
judgments          → id, case_name, year, court, bench, full_text, embedding
judgment_citations → from_judgment_id → to_judgment_id / to_statute_id
sros               → id, gazette_ref, title, date, content, embedding
document_chunks    → id, source_type, source_id, chunk_text, embedding, session_id

users              → id, email, password_hash, tier, created_at
user_subscriptions → id, user_id, plan, status, start_at, end_at
usage_logs         → id, user_id, action, created_at
user_documents     → id, user_id, title, content, status, created_at, updated_at
document_templates → id, category, title, content, is_active
legal_clauses      → id, category, title, text, tags
analysis_sessions  → id, user_id, file_key, status, created_at
```

---

## Security Model

| Layer | Mechanism |
|---|---|
| Authentication | JWT (15-min access + 7-day httpOnly refresh) |
| Authorization | Spring Security filter chain + per-endpoint role checks |
| Rate Limiting | Redis token bucket per user tier |
| Input Validation | Spring `@Valid` + Pydantic validators on all boundaries |
| LLM Prompt Injection | Query sanitization before prompt injection |
| CORS | Whitelist-only (frontend domain) |
| Secrets | `.env` files locally; Docker secrets in production |
| Bengali SQL Injection | UTF-8 parametrized queries; tested with Bengali input strings |
| Payment Security | SSLCommerz IPN signature validation on all webhooks |

---

## Deployment Architecture

### Local Development
```
Host machine:
  Ollama (native — GPU access)
  Spring Boot (./gradlew bootRun, port 8080)
  Python RAG service (uv run uvicorn, port 8000)
  Next.js (npm run dev, port 3000)

Docker Compose:
  PostgreSQL 16 + pgvector  → :5432
  Redis 7                   → :6379
  MinIO                     → :9000 / :9001
  Kafka KRaft               → :9092
```

### Production (Single VPS)
```
Cloudflare (CDN + DDoS protection)
        │
        ▼
Nginx (TLS termination, reverse proxy)
  /api/*  → Spring Boot :8080
  /*      → Next.js SSR :3000 (or Vercel)
  (gRPC)  → internal: Spring Boot → Python RAG :8000

Monitoring: Prometheus + Grafana + Uptime Kuma
```

---

## Subscription Tiers

| Feature | Free | Student | Pro |
|---|---|---|---|
| AI Queries / day | 5 | 30 | Unlimited |
| Statute Browse | Yes | Yes | Yes |
| Judgment Browse | Yes | Yes | Yes |
| AI Q&A | Yes | Yes | Yes |
| Document Editor | No | Yes | Yes |
| Templates Access | No | Yes | Yes |
| Document Export | No | Yes | Yes |
| Document Analysis | No | No | Yes |
| API Access | No | No | Yes |
| Price (BDT/month) | Free | ৳299 | ৳999 |

---

## Future Scope

### Phase 2: Intelligence Depth

**1. Citation Network Graph**
Build a navigable citation graph across the entire Bangladesh legal corpus. A judgment citing 10 other judgments and 3 statutes creates a traversable legal lineage. Users could trace the evolution of a legal doctrine across decades of Supreme Court decisions.

**2. Legal Doctrine Tracking**
Automatically cluster judgments by legal doctrine (e.g., "natural justice", "doctrine of promissory estoppel") using embedding similarity, and track how the court's position has evolved over time.

**3. Contradiction Detection**
Identify conflicting rulings on the same legal question. Flag when two High Court Division judgments reach opposite conclusions, with AI-generated analysis of the distinction.

**4. Case Outcome Prediction (Research Tool)**
Train a classifier on historical judgment metadata (facts, legal issues raised, bench composition) to probabilistically estimate case outcome — positioned as a research aid, not a legal opinion.

**5. Legislation Change Tracking**
Track amendments to statutes over time. When the Companies Act 1994 is amended, diff the old and new sections, highlight changes, and alert subscribed users automatically.

### Phase 3: Collaboration and Practice Tools

**6. Legal Workspace**
Team accounts for law firms. Shared document libraries, internal case notes, collaborative document editing (Operational Transformation or CRDT), and role-based permissions (partner, associate, clerk).

**7. Matter Management**
Lightweight case/matter management: link documents, queries, and research to a specific client matter. Export a matter brief with all associated research.

**8. AI Draft Review**
Upload a contract or pleading and receive AI-generated markup: potential loopholes, missing standard clauses, compliance gaps under Bangladeshi law, and suggested language improvements.

**9. Court Cause List Integration**
Scrape and display daily cause lists from the Supreme Court website. Users subscribe to cases and receive push notifications when a cause list entry appears.

**10. Legal Notice Generator**
Guided wizard to generate legally compliant demand notices, legal notices, and cease-and-desist letters under Bangladeshi law, with auto-population from matter data.

### Phase 4: Platform and API

**11. Public REST API**
A developer-tier API for law schools, legal tech startups, and government portals to embed Dhara's search and Q&A capabilities. Rate-limited by API key with a usage dashboard.

**12. Mobile Application**
React Native app for iOS and Android. Offline mode for downloaded statutes. Voice query input with Bengali speech-to-text. Push notifications for cause list updates.

**13. Chrome Extension**
Browser extension that detects legal citations on any webpage and shows a sidebar with the full statute text, related judgments, and AI explanation — without leaving the page.

**14. LLM Fine-Tuning on Bangladeshi Law**
Fine-tune an open-source base model (Mistral, Qwen, LLaMA) on a curated dataset of Bangladeshi statutes, judgments, and legal Q&A pairs. A domain-adapted model would substantially outperform general-purpose models on Bengali legal reasoning.

**15. Bangla Legal LLM (Research Initiative)**
Long-term research goal: a purpose-built language model pre-trained on the complete corpus of Bangladeshi statutory law, Supreme Court judgments (1972–present), and High Court decisions — the first such model in existence.

### Phase 5: Ecosystem and Access

**16. District Court Integration**
Expand coverage beyond the Supreme Court to all 64 district courts. Partner with the Law Commission of Bangladesh or bar associations for data access.

**17. Legal Aid Integration**
Free tier expansion or a separate grant-funded portal for legal aid organizations, NGOs, and public defenders — making AI legal research accessible to those serving marginalized communities.

**18. Law School Partnerships**
Academic licensing for all law schools in Bangladesh. Integration with curriculum: moot court research tools, case brief generators, and automated citation checkers for student submissions.

**19. Multilingual Expansion**
Beyond Bengali and English, add support for Chittagong regional dialect (Chattagram) and eventually support for legal documents from neighboring jurisdictions (India's High Court decisions directly cited in Bangladeshi judgments).

**20. Regulatory Compliance Monitor**
For corporations and compliance officers: automated monitoring of new SROs, gazette notifications, and regulatory changes relevant to a company's industry. Weekly digest emails. Alert on changes to specific regulations the company has flagged.

---

## Project Timeline

| Phase | Duration | Milestone |
|---|---|---|
| Phase 0 (Done) | Months 1–3 | Core architecture, RAG pipeline, provider abstraction, basic search |
| Phase 1 (Active) | Months 4–6 | Document management, templates, analysis, SSLCommerz, full launch |
| Phase 2 | Months 7–12 | Citation graph, doctrine tracking, legislation diff, contradiction detection |
| Phase 3 | Year 2 Q1–Q2 | Workspace, matter management, draft review, court cause list |
| Phase 4 | Year 2 Q3–Q4 | Public API, mobile app, Chrome extension |
| Phase 5 | Year 3+ | Fine-tuned LLM, district court data, law school partnerships, compliance monitor |

---

## Team Requirements

| Role | Responsibility |
|---|---|
| Backend Engineer (Java) | Spring Boot API, Flyway migrations, gRPC, Kafka |
| AI/ML Engineer (Python) | RAG pipeline, provider implementations, embeddings, evaluation |
| Frontend Engineer (TypeScript) | Next.js UI, i18n, component library, editor integration |
| Data Engineer | Scrapers, parsers, OCR pipeline, corpus quality |
| DevOps | Docker, Nginx, monitoring, CI/CD, VPS management |
| Legal Domain Expert | Content verification, template authoring, evaluation question curation |

---

## Summary

Dhara addresses a real and underserved gap in Bangladesh's legal infrastructure. The technical foundation — provider-abstracted RAG, multilingual embeddings, a hybrid search pipeline, and a scalable three-service architecture — is designed to grow from a single-VPS startup deployment to a nationally significant legal information platform. The subscription model creates a self-sustaining revenue path while the free tier ensures broad access for law students and junior practitioners. The future roadmap, from citation graph intelligence to a fine-tuned Bangla legal LLM, positions Dhara as the definitive AI legal platform for Bangladesh and a model for similar deployments across South Asia.

---

*Proposal prepared: April 2026*
*Project repository: /home/technonext/Dhara*
*Primary language: Bengali (bn) + English (en)*
*License: All rights reserved*
