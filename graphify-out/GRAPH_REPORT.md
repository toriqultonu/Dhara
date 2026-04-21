# Graph Report - .  (2026-04-21)

## Corpus Check
- Corpus is ~40,274 words - fits in a single context window. You may not need a graph.

## Summary
- 851 nodes · 1144 edges · 76 communities detected
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 196 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `LLMResponse` - 21 edges
2. `RAGPipeline` - 15 edges
3. `RerankResult` - 15 edges
4. `Factory for creating embedding providers from configuration.` - 15 edges
5. `DocumentService` - 15 edges
6. `Settings` - 14 edges
7. `DocumentService` - 14 edges
8. `EmbeddingResult` - 13 edges
9. `EmbeddingProvider Protocol` - 13 edges
10. `LLMRouter` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Citation Model (RAG)` --semantically_similar_to--> `Citation Type (Frontend)`  [INFERRED] [semantically similar]
  rag-service/app/models/ask.py → frontend/lib/types.ts
- `Constants (Tiers, Kafka, Status)` --semantically_similar_to--> `PricingPage`  [INFERRED] [semantically similar]
  backend/src/main/java/com/dhara/common/Constants.java → frontend/app/[locale]/pricing/page.tsx
- `SearchService (backend)` --references--> `SearchController`  [INFERRED]
  backend-CLAUDE.md → backend/src/main/java/com/dhara/search/SearchController.java
- `SearchController` --references--> `ApiResponse<T> Generic Wrapper`  [EXTRACTED]
  backend/src/main/java/com/dhara/search/SearchController.java → backend-CLAUDE.md
- `AskRequest DTO` --shares_data_with--> `RAGPipeline`  [INFERRED]
  backend/src/main/java/com/dhara/search/dto/AskRequest.java → rag-service-CLAUDE.md

## Hyperedges (group relationships)
- **RAGPipeline assembles EmbeddingProvider, RerankerProvider, LLMRouter, SearchService** — rag_pipeline_RAGPipeline, base_EmbeddingProvider, base_RerankerProvider, llm_router_LLMRouter, search_service_SearchService [EXTRACTED 1.00]
- **Provider Protocol Abstraction Layer (LLM, Embedding, Reranker)** — base_LLMProvider, base_EmbeddingProvider, base_RerankerProvider, base_LLMResponse, base_EmbeddingResult, base_RerankResult [EXTRACTED 1.00]
- **Mock Provider Fixtures for Test Isolation** — conftest_MockLLMProvider, conftest_MockEmbeddingProvider, conftest_MockRerankerProvider, test_llm_router_TestLLMRouter, test_rag_pipeline_TestRAGPipeline [INFERRED 0.85]
- **LLM Provider Abstraction Pattern** — base_LLMProvider, llm_factory_create_llm_provider, claude_provider_ClaudeLLMProvider, gemini_provider_GeminiLLMProvider, openai_llm_provider_OpenAILLMProvider, deepseek_provider_DeepSeekLLMProvider, ollama_llm_provider_OllamaLLMProvider [EXTRACTED 1.00]
- **Embedding Provider Abstraction Pattern** — base_EmbeddingProvider, embedding_factory_create_embedding_provider, bgem3_provider_BGEM3EmbeddingProvider, openai_embedding_provider_OpenAIEmbeddingProvider, ollama_embedding_provider_OllamaEmbeddingProvider [EXTRACTED 1.00]
- **Reranker Provider Abstraction Pattern** — base_RerankerProvider, reranker_factory_create_reranker_provider, bge_reranker_BGERerankerProvider, cohere_reranker_CohereRerankerProvider, noop_reranker_NoopRerankerProvider [EXTRACTED 1.00]
- **RAG Prompt Generation Pipeline** — prompts_legal_qa_BuildLegalQAPrompt, models_ask_AskRequest, ask_router_AskRouter [INFERRED 0.82]
- **Frontend Chat UI Flow** — chat_ChatInterface, chat_MessageBubble, chat_CitationLink, chat_TypingIndicator [EXTRACTED 0.95]
- **Frontend i18n / Locale System** — frontend_middleware_I18nMiddleware, frontend_next_config_NextConfig, layout_LanguageToggle [INFERRED 0.85]
- **Search UI Data Flow: Hook → Component → Types** — hooks_usesearch_useSearch, search_searchresults_SearchResults, lib_types_SearchResult [INFERRED 0.88]
- **UI Primitives all consuming cn utility** — ui_input_Input, ui_card_Card, ui_button_Button, ui_badge_Badge [EXTRACTED 1.00]
- **Auth + Subscription Hook Flow via api singleton** — lib_auth_useAuth, hooks_usesubscription_useSubscription, lib_api_api [INFERRED 0.82]
- **Document CRUD Flow: Controller → Service → Repository → Entity** — backend_documentcontroller, backend_documentservice, repo_userdocument, entity_userdocument [EXTRACTED 1.00]
- **Authentication Pages using shared UI components and backend auth API** — page_login, page_register, ui_card, ui_button, ui_input [EXTRACTED 0.95]
- **Document Export Pipeline: ExportRequest → DocumentService → PDF/DOCX/TXT output** — dto_exportrequest, backend_documentservice, backend_documentcontroller [EXTRACTED 0.95]
- **SSLCommerz Payment Activation Flow** — subscription_SslCommerzWebhookController, subscription_SslCommerzService, repository_UserSubscriptionRepository [EXTRACTED 0.95]
- **Global Exception Handling Pattern** — common_GlobalExceptionHandler, common_ResourceNotFoundException, common_PagedResponse [INFERRED 0.72]
- **Legal Content Repository Layer** — repository_StatuteRepository, repository_SectionRepository, repository_JudgmentRepository, repository_SroRepository [INFERRED 0.88]
- **Legal CRUD Service-Controller-DTO Pattern** — sroservice_sroservice, srocontroller_srocontroller, sroresponse_sroresponse [INFERRED 0.90]
- **Statute Layered Architecture (Service+Controllers+DTOs)** — statuteservice_statuteservice, statutecontroller_statutecontroller, sectioncontroller_sectioncontroller, statuteresponse_statuteresponse, sectionresponse_sectionresponse, statutelistresponse_statutelistresponse [INFERRED 0.88]
- **Subscription Payment Initiation Flow** — paymentcontroller_paymentcontroller, paymentinitrequest_paymentinitrequest, subscriptionservice_subscriptionservice [INFERRED 0.80]
- **Analysis Pipeline: Upload → Session → Query** — analysiscontroller, analysisservice, entity_analysissession, analysisuploadresponse, analysisqueryrequest, analysisqueryresponse [EXTRACTED 0.95]
- **Judgment Cross-Reference Citation Network** — entity_judgment, entity_judgmentjudgmentcitation, entity_judgmentstatutecitation, entity_statute [EXTRACTED 0.95]
- **User-Owned Entities Pattern** — entity_user, entity_userdocument, entity_analysissession, entity_usersubscription, entity_usagelog [INFERRED 0.88]
- **Authentication Pipeline: Register/Login → UserService → JwtService → AuthResponse** — auth_AuthController, auth_UserService, auth_JwtService, auth_dto_AuthResponse [EXTRACTED 0.95]
- **Rate Limit Enforcement in Search: SearchService checks RateLimiter, throws RateLimitExceededException** — search_SearchService, ratelimit_RateLimiter, ratelimit_RateLimitExceededException [EXTRACTED 0.95]
- **Legal Content Browse Pattern: Controller → Service → Entity-backed DTO** — clause_ClauseController, clause_ClauseService, entity_LegalClause, clause_dto_ClauseResponse [EXTRACTED 0.90]
- **Backend Infrastructure Configuration (Security + CORS + Redis + Kafka + gRPC)** — securityconfig_SecurityConfig, corsconfig_CorsConfig, redisconfig_RedisConfig, kafkaconfig_KafkaConfig, grpcconfig_GrpcConfig [INFERRED 0.85]
- **Search/Ask Request Flow (Controller → Service → gRPC → RAG)** — searchcontroller_SearchController, backendclaude_SearchService, backendclaude_RagServiceClient, ragclaude_RAGPipeline [EXTRACTED 1.00]
- **Search DTOs (Request, AskRequest, Response)** — searchrequest_SearchRequest, askrequest_AskRequest, searchresponse_SearchResponse [EXTRACTED 0.95]

## Communities

### Community 0 - "Provider Protocol Abstractions"
Cohesion: 0.03
Nodes (34): EmbeddingResult, LLMResponse, Abstract provider protocols for all AI components., RerankResult, BGERerankerProvider, BGE Reranker provider — local model., BGEM3EmbeddingProvider, BGE-M3 embedding provider — local model via FlagEmbedding. (+26 more)

### Community 1 - "Document CRUD API"
Cohesion: 0.04
Nodes (18): DocumentController, PaymentController, PaymentInitRequest, Section, SectionController, SectionRepository, SectionResponse, Sro (+10 more)

### Community 2 - "Document Entities & Audit"
Cohesion: 0.04
Nodes (20): AuditableEntity, JudgmentJudgmentCitation, JudgmentStatuteCitation, PlanController, PlanResponse, ResourceNotFoundException, SslCommerzService, SubscriptionController (+12 more)

### Community 3 - "RAG Ask Pipeline"
Cohesion: 0.05
Nodes (33): AskRequest, AskResponse, Citation, RAGResponse, Ask/RAG request/response models., Ask router — full RAG Q&A endpoint., EmbeddingProvider, LLMProvider (+25 more)

### Community 4 - "Frontend API Client"
Cohesion: 0.06
Nodes (2): ApiClient, ApiError

### Community 5 - "FastAPI App & Provider Base"
Cohesion: 0.1
Nodes (46): Settings (pydantic-settings), settings singleton, FastAPI Application Entry Point, FastAPI Lifespan Context Manager, EmbeddingProvider Protocol, EmbeddingResult Dataclass, LLMProvider Protocol, LLMResponse Dataclass (+38 more)

### Community 6 - "Java RAG gRPC Client"
Cohesion: 0.07
Nodes (9): Constants, RagAskResponse, RagCitation, RagServiceClient, RateLimiter, RedisRateLimiter, SearchController, SearchService (+1 more)

### Community 7 - "Document Analysis Feature"
Cohesion: 0.11
Nodes (9): AnalysisController, AnalysisService, AnalysisSession, AnalysisSessionRepository, AnalysisSession Entity, SubscriptionPlan Entity, UsageLog Entity, User JPA Entity (+1 more)

### Community 8 - "Auth Controller & Exceptions"
Cohesion: 0.09
Nodes (5): AuthController, AuthException, GlobalExceptionHandler, RateLimitExceededException, UserService

### Community 9 - "Chat UI & RAG Types"
Cohesion: 0.11
Nodes (22): Ask Router (RAG Q&A Endpoint), ChatInterface Component, CitationLink Component, MessageBubble Component, TypingIndicator Component, Tailwind CSS Config, AskResponse Interface, ChatMessage Type (Frontend) (+14 more)

### Community 10 - "Frontend Hooks & Auth State"
Cohesion: 0.11
Nodes (22): useAuth Hook (hooks), useSearch Hook, useSubscription Hook, ApiClient Class, ApiError Class, api Singleton, AuthContext, useAuth Hook (lib) (+14 more)

### Community 11 - "Backend Architecture Docs"
Cohesion: 0.12
Nodes (21): AskRequest DTO, ApiResponse<T> Generic Wrapper, Backend Spring Boot Service (CLAUDE doc), Rationale: @MockitoBean not @MockBean (Spring Boot 3.4+), RagServiceClient, RateLimiter Interface, RedisRateLimiter, SearchService (backend) (+13 more)

### Community 12 - "Common Backend Utilities"
Cohesion: 0.12
Nodes (20): AuditableEntity, GlobalExceptionHandler, PagedResponse, ResourceNotFoundException, UsageEvent, UsageEventProducer, AnalysisSessionRepository, DocumentTemplateRepository (+12 more)

### Community 13 - "Legal Document Templates"
Cohesion: 0.13
Nodes (4): DocumentTemplate, DocumentTemplateRepository, TemplateController, TemplateService

### Community 14 - "Judgment Entities & API"
Cohesion: 0.14
Nodes (5): Judgment, JudgmentController, JudgmentListResponse, JudgmentRepository, JudgmentService

### Community 15 - "Backend Entry & Document Layer"
Cohesion: 0.19
Nodes (18): DharaApplication (Spring Boot Entry), DocumentController, DocumentService, ApiResponse<T> Wrapper, PagedResponse<T>, ResourceNotFoundException, DocumentListResponse DTO, DocumentRequest DTO (+10 more)

### Community 16 - "Provider Factory Tests"
Cohesion: 0.12
Nodes (4): Tests for provider factories., TestEmbeddingProviderFactory, TestLLMProviderFactory, TestRerankerProviderFactory

### Community 17 - "Search UI & Pages"
Cohesion: 0.21
Nodes (16): Constants (Tiers, Kafka, Status), FilterPanel Component, SearchBar Component, SearchResults Component, Frontend Type Definitions, HomePage (Landing Page), JudgmentsPage, LoginPage (+8 more)

### Community 18 - "Document Export Service"
Cohesion: 0.24
Nodes (1): DocumentService

### Community 19 - "Legal Clause Library"
Cohesion: 0.15
Nodes (4): ClauseController, ClauseService, LegalClause, LegalClauseRepository

### Community 20 - "JWT Auth Pipeline"
Cohesion: 0.23
Nodes (12): AuthController, JwtAuthFilter, JwtService, UserService, AuthResponse DTO, LoginRequest DTO, RegisterRequest DTO, AuthException (+4 more)

### Community 21 - "Layout Components"
Cohesion: 0.2
Nodes (0): 

### Community 22 - "Document Embedding Pipeline"
Cohesion: 0.38
Nodes (6): fetch_documents(), main(), Batch embedding pipeline for all legal documents.  Reads statutes, judgments, an, Yield batches of documents that don't have embeddings yet., Insert embeddings into document_chunks table., store_embeddings()

### Community 23 - "SSLCommerz Payment Webhooks"
Cohesion: 0.29
Nodes (1): SslCommerzWebhookController

### Community 24 - "JWT Token Service"
Cohesion: 0.43
Nodes (1): JwtService

### Community 25 - "Spring Security Config"
Cohesion: 0.29
Nodes (2): JwtAuthFilter, SecurityConfig

### Community 26 - "Legal Content Entities"
Cohesion: 0.38
Nodes (7): Judgment Entity, JudgmentJudgmentCitation Entity, JudgmentStatuteCitation Entity, Section Entity, Sro Entity, Statute Entity, JudgmentResponse DTO

### Community 27 - "Security & CORS Config Docs"
Cohesion: 0.33
Nodes (6): JwtAuthFilter, CorsConfig, Frontend Design System (navy/gold/green palette), Frontend Next.js Service (CLAUDE doc), i18n (next-intl bilingual bn/en), SecurityConfig

### Community 28 - "RAG Quality Evaluation"
Cohesion: 0.6
Nodes (4): EvalResult, evaluate_question(), main(), RAG quality evaluation script.  Runs a set of test questions (Bengali + English)

### Community 29 - "Frontend i18n & Config"
Cohesion: 0.67
Nodes (4): i18n Routing Middleware (next-intl), Next.js Config (next-intl plugin), Header Component, LanguageToggle Component

### Community 30 - "Clause Feature Module"
Cohesion: 0.83
Nodes (4): ClauseController, ClauseService, ClauseResponse DTO, LegalClause Entity

### Community 31 - "Template Feature Module"
Cohesion: 1.0
Nodes (4): TemplateController, TemplateService, TemplateListResponse DTO, TemplateResponse DTO

### Community 32 - "Kafka Usage Events"
Cohesion: 0.5
Nodes (4): Rationale: lz4 over snappy for Alpine Kafka, UsageEvent record, UsageEventProducer, KafkaConfig

### Community 33 - "Noop Reranker Tests"
Cohesion: 0.67
Nodes (0): 

### Community 34 - "Legal Q&A Prompts"
Cohesion: 0.67
Nodes (1): Legal Q&A prompt templates for the Dhara RAG pipeline.

### Community 35 - "Case Comparison Prompts"
Cohesion: 1.0
Nodes (2): build_case_comparison_prompt(), _format_case_block()

### Community 36 - "Spring Boot Entry Point"
Cohesion: 0.67
Nodes (1): DharaApplication

### Community 37 - "Redis Config"
Cohesion: 0.67
Nodes (1): RedisConfig

### Community 38 - "CORS Config"
Cohesion: 0.67
Nodes (1): CorsConfig

### Community 39 - "gRPC Channel Config"
Cohesion: 0.67
Nodes (1): GrpcConfig

### Community 40 - "Case Summary Prompts"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Kafka Config"
Cohesion: 1.0
Nodes (1): KafkaConfig

### Community 42 - "Frontend Date & Numerals Util"
Cohesion: 1.0
Nodes (2): formatDate Utility, getBengaliNumeral Utility

### Community 43 - "i18n Request Config"
Cohesion: 1.0
Nodes (2): i18n getRequestConfig, i18n Config (locales)

### Community 44 - "Next.js App Layouts"
Cohesion: 1.0
Nodes (2): RootLayout (app), LocaleLayout

### Community 45 - "Ask Page & Chat Component"
Cohesion: 1.0
Nodes (2): ChatInterface Component, AskPage (AI Q&A)

### Community 46 - "Project Documentation"
Cohesion: 1.0
Nodes (2): Dhara Project Overview (README), Setup & Deployment Guide

### Community 47 - "i18n Middleware"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Python Package Init"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Next.js Config"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Next.js Env Types"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Tailwind Config"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "i18n Module"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Request Config"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "useAuth Hook"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Share Document Response"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Document Request DTO"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Export Request DTO"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Document Stats Response"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Share Document Request"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Usage Event Module"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Health Response Model"
Cohesion: 1.0
Nodes (1): HealthResponse Model

### Community 62 - "Error Response Model"
Cohesion: 1.0
Nodes (1): ErrorResponse Model

### Community 63 - "Case Summary Prompt Builder"
Cohesion: 1.0
Nodes (1): build_case_summary_prompt Function

### Community 64 - "Case Comparison Prompt Builder"
Cohesion: 1.0
Nodes (1): build_case_comparison_prompt Function

### Community 65 - "Footer Component"
Cohesion: 1.0
Nodes (1): Footer Component

### Community 66 - "Loading UI Component"
Cohesion: 1.0
Nodes (1): Loading Component

### Community 67 - "Search Response Type"
Cohesion: 1.0
Nodes (1): SearchResponse Interface

### Community 68 - "Plan Response Type"
Cohesion: 1.0
Nodes (1): PlanResponse Interface

### Community 69 - "Statute List Response Type"
Cohesion: 1.0
Nodes (1): StatuteListResponse Interface

### Community 70 - "Judgment List Response Type"
Cohesion: 1.0
Nodes (1): JudgmentListResponse Interface

### Community 71 - "Document List Response Type"
Cohesion: 1.0
Nodes (1): DocumentListResponse Interface

### Community 72 - "Template List Response Type"
Cohesion: 1.0
Nodes (1): TemplateListResponse Interface

### Community 73 - "Analysis Upload Response"
Cohesion: 1.0
Nodes (1): AnalysisUploadResponse Interface

### Community 74 - "Verify Response Type"
Cohesion: 1.0
Nodes (1): VerifyResponse Interface

### Community 75 - "RAG Service Docs"
Cohesion: 1.0
Nodes (1): RAG Service (CLAUDE doc)

## Ambiguous Edges - Review These
- `AnalysisQueryResponse.java` → `JudgmentStatuteCitation Entity`  [AMBIGUOUS]
  backend/src/main/java/com/dhara/analysis/dto/AnalysisQueryResponse.java · relation: semantically_similar_to

## Knowledge Gaps
- **109 isolated node(s):** `Batch embedding pipeline for all legal documents.  Reads statutes, judgments, an`, `Yield batches of documents that don't have embeddings yet.`, `Insert embeddings into document_chunks table.`, `RAG quality evaluation script.  Runs a set of test questions (Bengali + English)`, `Tests for provider factories.` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Case Summary Prompts`** (2 nodes): `case_summary.py`, `build_case_summary_prompt()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Kafka Config`** (2 nodes): `KafkaConfig.java`, `KafkaConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Date & Numerals Util`** (2 nodes): `formatDate Utility`, `getBengaliNumeral Utility`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `i18n Request Config`** (2 nodes): `i18n getRequestConfig`, `i18n Config (locales)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js App Layouts`** (2 nodes): `RootLayout (app)`, `LocaleLayout`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Ask Page & Chat Component`** (2 nodes): `ChatInterface Component`, `AskPage (AI Q&A)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Documentation`** (2 nodes): `Dhara Project Overview (README)`, `Setup & Deployment Guide`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `i18n Middleware`** (1 nodes): `middleware.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Python Package Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Env Types`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Config`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `i18n Module`** (1 nodes): `i18n.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Request Config`** (1 nodes): `request.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `useAuth Hook`** (1 nodes): `useAuth.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Share Document Response`** (1 nodes): `ShareDocumentResponse.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Document Request DTO`** (1 nodes): `DocumentRequest.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Export Request DTO`** (1 nodes): `ExportRequest.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Document Stats Response`** (1 nodes): `DocumentStatsResponse.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Share Document Request`** (1 nodes): `ShareDocumentRequest.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Usage Event Module`** (1 nodes): `UsageEvent.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Health Response Model`** (1 nodes): `HealthResponse Model`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Error Response Model`** (1 nodes): `ErrorResponse Model`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Case Summary Prompt Builder`** (1 nodes): `build_case_summary_prompt Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Case Comparison Prompt Builder`** (1 nodes): `build_case_comparison_prompt Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Footer Component`** (1 nodes): `Footer Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Loading UI Component`** (1 nodes): `Loading Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Search Response Type`** (1 nodes): `SearchResponse Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Plan Response Type`** (1 nodes): `PlanResponse Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Statute List Response Type`** (1 nodes): `StatuteListResponse Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Judgment List Response Type`** (1 nodes): `JudgmentListResponse Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Document List Response Type`** (1 nodes): `DocumentListResponse Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Template List Response Type`** (1 nodes): `TemplateListResponse Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Analysis Upload Response`** (1 nodes): `AnalysisUploadResponse Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Verify Response Type`** (1 nodes): `VerifyResponse Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `RAG Service Docs`** (1 nodes): `RAG Service (CLAUDE doc)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `AnalysisQueryResponse.java` and `JudgmentStatuteCitation Entity`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `embed()` connect `RAG Ask Pipeline` to `FastAPI App & Provider Base`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `EmbeddingProvider Protocol` connect `FastAPI App & Provider Base` to `RAG Ask Pipeline`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `LLMResponse` (e.g. with `TestLLMRouter` and `Tests for LLM router smart routing logic.`) actually correct?**
  _`LLMResponse` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `RAGPipeline` (e.g. with `FastAPI application entry point.` and `EmbeddingProvider`) actually correct?**
  _`RAGPipeline` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `RerankResult` (e.g. with `TestRAGPipeline` and `Tests for RAG pipeline.`) actually correct?**
  _`RerankResult` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `Factory for creating embedding providers from configuration.` (e.g. with `RerankerProvider` and `BGERerankerProvider`) actually correct?**
  _`Factory for creating embedding providers from configuration.` has 14 INFERRED edges - model-reasoned connections that need verification._