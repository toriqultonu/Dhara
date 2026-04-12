# Graph Report - C:/Github/Dhara  (2026-04-12)

## Corpus Check
- Corpus is ~27,061 words - fits in a single context window. You may not need a graph.

## Summary
- 586 nodes · 750 edges · 52 communities detected
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 102 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `LLMResponse` - 21 edges
2. `RerankResult` - 15 edges
3. `Factory for creating reranker providers.` - 15 edges
4. `RAGPipeline` - 15 edges
5. `EmbeddingResult` - 13 edges
6. `LLMRouter` - 12 edges
7. `EmbeddingProvider` - 9 edges
8. `Full RAG pipeline: Query -> Embed -> Search -> Rerank -> Generate -> Cite` - 9 edges
9. `ApiClient` - 8 edges
10. `SearchService` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Anthropic Claude LLM provider.` --uses--> `LLMResponse`  [INFERRED]
  rag-service\app\providers\llm\claude_provider.py → rag-service\app\providers\base.py
- `DeepSeek LLM provider — uses OpenAI-compatible API.` --uses--> `LLMResponse`  [INFERRED]
  rag-service\app\providers\llm\deepseek_provider.py → rag-service\app\providers\base.py
- `Google Gemini LLM provider.` --uses--> `LLMResponse`  [INFERRED]
  rag-service\app\providers\llm\gemini_provider.py → rag-service\app\providers\base.py
- `BGE-M3 embedding provider — local model via FlagEmbedding.` --uses--> `EmbeddingResult`  [INFERRED]
  rag-service\app\providers\embedding\bgem3_provider.py → rag-service\app\providers\base.py
- `FastAPI application entry point.` --uses--> `LLMRouter`  [INFERRED]
  rag-service\app\main.py → rag-service\app\services\llm_router.py

## Hyperedges (group relationships)
- **RAG Provider Abstraction System (LLM + Embedding + Reranker Protocols + Factories)** — llm_provider_protocol, embedding_provider_protocol, reranker_provider_protocol, llm_provider_factory, embedding_provider_factory, reranker_provider_factory [EXTRACTED 1.00]
- **RAG Pipeline Orchestration (Embed â†’ Search â†’ Rerank â†’ Generate â†’ Cite)** — rag_pipeline, search_service, llm_router, embedding_provider_protocol [EXTRACTED 1.00]
- **Backend-to-RAG gRPC Bridge (SearchService â†’ RagServiceClient â†’ gRPC â†’ RAGPipeline)** — backend_search_service, rag_service_client, grpc_rag_service_proto [EXTRACTED 1.00]

## Communities

### Community 0 - "Frontend API Client"
Cohesion: 0.05
Nodes (2): ApiClient, ApiError

### Community 1 - "Project Architecture & Docs"
Cohesion: 0.06
Nodes (53): ApiResponse<T> Generic Wrapper, Backend SearchService (rate-limit + gRPC proxy), Bengali (Bangla) Language Support, BGE Reranker Provider (Local), BGE-M3 Embedding Provider (Local), Claude LLM Provider, Backend Spring Boot Service, Dhara Project Overview (+45 more)

### Community 2 - "RAG Ask Pipeline"
Cohesion: 0.06
Nodes (26): AskRequest, AskResponse, Citation, RAGResponse, Ask/RAG request/response models., Ask router — full RAG Q&A endpoint., EmbeddingProvider, RerankerProvider (+18 more)

### Community 3 - "Provider Abstraction Protocols"
Cohesion: 0.06
Nodes (21): EmbeddingResult, LLMResponse, Abstract provider protocols for all AI components., RerankResult, BGERerankerProvider, BGE Reranker provider — local model., CohereRerankerProvider, Cohere Reranker provider. (+13 more)

### Community 4 - "Payment & API Response Layer"
Cohesion: 0.05
Nodes (10): PaymentController, PlanController, Section, SectionController, SectionRepository, Statute, StatuteController, StatuteRepository (+2 more)

### Community 5 - "Backend Domain Entities"
Cohesion: 0.06
Nodes (14): AuditableEntity, JudgmentJudgmentCitation, JudgmentStatuteCitation, ResourceNotFoundException, SslCommerzService, SubscriptionPlan, SubscriptionPlanRepository, SubscriptionService (+6 more)

### Community 6 - "LLM Provider Factory"
Cohesion: 0.06
Nodes (7): Factory for creating reranker providers., GeminiLLMProvider, Google Gemini LLM provider., OllamaEmbeddingProvider, OllamaLLMProvider, OpenAIEmbeddingProvider, OpenAILLMProvider

### Community 7 - "Judgment Legal Module"
Cohesion: 0.07
Nodes (8): Judgment, JudgmentController, JudgmentRepository, JudgmentService, Sro, SroController, SroRepository, SroService

### Community 8 - "gRPC RAG Service Client"
Cohesion: 0.08
Nodes (7): Constants, RagServiceClient, RateLimiter, RedisRateLimiter, SearchController, SearchService, UsageEventProducer

### Community 9 - "Authentication & JWT"
Cohesion: 0.09
Nodes (5): AuthController, AuthException, GlobalExceptionHandler, RateLimitExceededException, UserService

### Community 10 - "Provider Factory Tests"
Cohesion: 0.12
Nodes (4): Tests for provider factories., TestEmbeddingProviderFactory, TestLLMProviderFactory, TestRerankerProviderFactory

### Community 11 - "LLM Router Logic"
Cohesion: 0.15
Nodes (4): LLMProvider, LLMRouter, Tests for LLM router smart routing logic., TestLLMRouter

### Community 12 - "Backend Infrastructure Config"
Cohesion: 0.2
Nodes (11): Spring Security Config, Data Pipeline (Scrapers & Parsers), Flyway DB Migrations, Issue: DB Password Auth Failed for user toriqul (Flyway startup), Judgment JPA Entity, JWT Service (Auth), MinIO Object Storage, PostgreSQL + pgvector Database (+3 more)

### Community 13 - "BGE-M3 Embedding Provider"
Cohesion: 0.25
Nodes (2): BGEM3EmbeddingProvider, BGE-M3 embedding provider — local model via FlagEmbedding.

### Community 14 - "Claude LLM Provider"
Cohesion: 0.25
Nodes (2): ClaudeLLMProvider, Anthropic Claude LLM provider.

### Community 15 - "DeepSeek LLM Provider"
Cohesion: 0.25
Nodes (2): DeepSeekLLMProvider, DeepSeek LLM provider — uses OpenAI-compatible API.

### Community 16 - "JWT Auth Filter & Security"
Cohesion: 0.29
Nodes (2): JwtAuthFilter, SecurityConfig

### Community 17 - "JWT Token Service"
Cohesion: 0.43
Nodes (1): JwtService

### Community 18 - "SSLCommerz Webhook"
Cohesion: 0.29
Nodes (1): SslCommerzWebhookController

### Community 19 - "Batch Document Embedding"
Cohesion: 0.38
Nodes (6): fetch_documents(), main(), Batch embedding pipeline for all legal documents.  Reads statutes, judgments, an, Yield batches of documents that don't have embeddings yet., Insert embeddings into document_chunks table., store_embeddings()

### Community 20 - "Layout Components"
Cohesion: 0.4
Nodes (0): 

### Community 21 - "RAG Quality Evaluation"
Cohesion: 0.6
Nodes (4): EvalResult, evaluate_question(), main(), RAG quality evaluation script.  Runs a set of test questions (Bengali + English)

### Community 22 - "RAG Service Config"
Cohesion: 0.5
Nodes (3): BaseSettings, All configuration via environment variables. No hardcoded values., Settings

### Community 23 - "Spring Boot Entry Point"
Cohesion: 0.67
Nodes (1): DharaApplication

### Community 24 - "CORS Configuration"
Cohesion: 0.67
Nodes (1): CorsConfig

### Community 25 - "gRPC Client Config"
Cohesion: 0.67
Nodes (1): GrpcConfig

### Community 26 - "Redis Cache Config"
Cohesion: 0.67
Nodes (1): RedisConfig

### Community 27 - "Case Comparison Prompt"
Cohesion: 1.0
Nodes (2): build_case_comparison_prompt(), _format_case_block()

### Community 28 - "Legal QA Prompt"
Cohesion: 0.67
Nodes (1): Legal Q&A prompt templates for the Dhara RAG pipeline.

### Community 29 - "No-Op Reranker Tests"
Cohesion: 0.67
Nodes (0): 

### Community 30 - "Kafka Event Config"
Cohesion: 1.0
Nodes (1): KafkaConfig

### Community 31 - "Sidebar Navigation"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Loading UI Component"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Modal UI Component"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Select UI Component"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Toast Notification"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Case Summary Prompt"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Subscription & Payment"
Cohesion: 1.0
Nodes (2): SSLCommerz Payment Service, SubscriptionPlan JPA Entity

### Community 38 - "Next.js Middleware"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Usage Event Tracking"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Next.js Config"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Tailwind CSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Amendment History"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Citation Map"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Section Navigation"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Auth Hook"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "HTTP Request Util"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "i18n Config"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Package Init"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Root Issue Log"
Cohesion: 1.0
Nodes (1): Root Issue Log (gradlew not found)

### Community 50 - "Backend Issue Log"
Cohesion: 1.0
Nodes (1): Backend Issue Log (DB auth failure)

### Community 51 - "Judgment Viewer"
Cohesion: 1.0
Nodes (1): JudgmentViewer Component

## Knowledge Gaps
- **47 isolated node(s):** `AuditableEntity`, `KafkaConfig`, `Judgment`, `JudgmentJudgmentCitation`, `JudgmentStatuteCitation` (+42 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Kafka Event Config`** (2 nodes): `KafkaConfig.java`, `KafkaConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sidebar Navigation`** (2 nodes): `Sidebar.tsx`, `Sidebar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Loading UI Component`** (2 nodes): `Loading.tsx`, `Loading()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Modal UI Component`** (2 nodes): `Modal.tsx`, `Modal()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Select UI Component`** (2 nodes): `Select.tsx`, `Select()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Toast Notification`** (2 nodes): `Toast.tsx`, `Toast()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Case Summary Prompt`** (2 nodes): `case_summary.py`, `build_case_summary_prompt()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Subscription & Payment`** (2 nodes): `SSLCommerz Payment Service`, `SubscriptionPlan JPA Entity`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Middleware`** (1 nodes): `middleware.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Usage Event Tracking`** (1 nodes): `UsageEvent.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind CSS Config`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Amendment History`** (1 nodes): `AmendmentHistory.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Citation Map`** (1 nodes): `CitationMap.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Section Navigation`** (1 nodes): `SectionNav.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Hook`** (1 nodes): `useAuth.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `HTTP Request Util`** (1 nodes): `request.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `i18n Config`** (1 nodes): `i18n.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Package Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Root Issue Log`** (1 nodes): `Root Issue Log (gradlew not found)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Issue Log`** (1 nodes): `Backend Issue Log (DB auth failure)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Judgment Viewer`** (1 nodes): `JudgmentViewer Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LLMResponse` connect `Provider Abstraction Protocols` to `Project Architecture & Docs`, `LLM Provider Factory`, `LLM Router Logic`, `Claude LLM Provider`, `DeepSeek LLM Provider`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `Factory for creating reranker providers.` connect `LLM Provider Factory` to `RAG Ask Pipeline`, `Provider Abstraction Protocols`, `LLM Router Logic`, `BGE-M3 Embedding Provider`, `Claude LLM Provider`, `DeepSeek LLM Provider`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `RAGPipeline` connect `RAG Ask Pipeline` to `LLM Router Logic`, `Provider Abstraction Protocols`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `LLMResponse` (e.g. with `ClaudeLLMProvider` and `Anthropic Claude LLM provider.`) actually correct?**
  _`LLMResponse` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `RerankResult` (e.g. with `BGERerankerProvider` and `BGE Reranker provider — local model.`) actually correct?**
  _`RerankResult` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `Factory for creating reranker providers.` (e.g. with `EmbeddingProvider` and `BGEM3EmbeddingProvider`) actually correct?**
  _`Factory for creating reranker providers.` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `RAGPipeline` (e.g. with `FastAPI application entry point.` and `EmbeddingProvider`) actually correct?**
  _`RAGPipeline` has 9 INFERRED edges - model-reasoned connections that need verification._