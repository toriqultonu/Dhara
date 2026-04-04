# CLAUDE.md — Dhara Backend (Spring Boot API)

> **Service:** `backend/` — Spring Boot 3.x with Java 21
> **Role:** API gateway, authentication, legal document CRUD, search proxy, subscriptions, rate limiting
> **Port:** 8080 (dev), configurable via `server.port`

---

## 📌 Service Responsibilities

1. **Authentication** — JWT + Google OAuth, user registration/login
2. **Legal Document APIs** — CRUD for statutes, sections, judgments, SROs
3. **Search Proxy** — Receives search requests, enforces rate limits, delegates to RAG service via gRPC
4. **Subscription Management** — Plans, payments (SSLCommerz), usage tracking
5. **Rate Limiting** — Redis-based per user tier
6. **Usage Analytics** — Kafka producer logging queries, tokens, costs

---

## 🏗️ Package Structure

```
src/main/java/com/dhara/
├── DharaApplication.java
│
├── config/
│   ├── SecurityConfig.java          # Spring Security + JWT filter chain
│   ├── RedisConfig.java             # RedisTemplate, cache manager
│   ├── KafkaConfig.java             # Producer config for usage analytics
│   ├── GrpcConfig.java              # gRPC channel to RAG service
│   ├── CorsConfig.java              # CORS whitelist (frontend origin only)
│   └── SwaggerConfig.java           # SpringDoc OpenAPI 3 config
│
├── auth/
│   ├── AuthController.java          # POST /api/auth/register, /login, /refresh
│   ├── JwtService.java              # Token generation, validation, refresh
│   ├── JwtAuthFilter.java           # OncePerRequestFilter for JWT
│   ├── UserService.java             # User CRUD, password encoding
│   ├── GoogleOAuthService.java      # Google OAuth2 integration
│   ├── dto/
│   │   ├── LoginRequest.java        # record
│   │   ├── RegisterRequest.java     # record
│   │   └── AuthResponse.java        # record (token, refreshToken, user)
│   └── exception/
│       └── AuthException.java
│
├── legal/
│   ├── statute/
│   │   ├── StatuteController.java   # GET /api/statutes, /api/statutes/{id}
│   │   ├── StatuteService.java
│   │   ├── SectionController.java   # GET /api/statutes/{id}/sections
│   │   └── dto/
│   │       ├── StatuteResponse.java
│   │       ├── StatuteListResponse.java
│   │       └── SectionResponse.java
│   ├── judgment/
│   │   ├── JudgmentController.java  # GET /api/judgments, /api/judgments/{id}
│   │   ├── JudgmentService.java
│   │   └── dto/
│   │       ├── JudgmentResponse.java
│   │       └── JudgmentListResponse.java
│   └── sro/
│       ├── SroController.java       # GET /api/sros, /api/sros/{id}
│       ├── SroService.java
│       └── dto/
│           └── SroResponse.java
│
├── search/
│   ├── SearchController.java        # POST /api/search, POST /api/ask
│   ├── SearchService.java           # Rate limit check → gRPC call → return
│   ├── dto/
│   │   ├── SearchRequest.java       # record (query, language, filters)
│   │   ├── SearchResponse.java      # record (results[], aiAnswer?, citations[])
│   │   └── AskRequest.java          # record (question, conversationId?)
│   └── grpc/
│       ├── RagServiceClient.java    # gRPC stub wrapper
│       └── RagServiceGrpcConfig.java
│
├── subscription/
│   ├── PlanController.java          # GET /api/plans
│   ├── SubscriptionController.java  # POST /api/subscribe, GET /api/my-subscription
│   ├── PaymentController.java       # POST /api/payment/init, webhook callback
│   ├── SubscriptionService.java
│   ├── SslCommerzService.java       # SSLCommerz API integration
│   ├── dto/
│   │   ├── PlanResponse.java
│   │   ├── SubscriptionResponse.java
│   │   └── PaymentInitRequest.java
│   └── webhook/
│       └── SslCommerzWebhookController.java  # IPN callback handler
│
├── ratelimit/
│   ├── RateLimiter.java             # Interface
│   ├── RedisRateLimiter.java        # Redis INCR + EXPIRE sliding window
│   └── RateLimitExceededException.java
│
├── entity/
│   ├── User.java                    # @Entity — id, email, passwordHash, name, role, barCouncilId
│   ├── Statute.java                 # @Entity — id, actNumber, titleEn, titleBn, year, status, ...
│   ├── Section.java                 # @Entity — id, statute, sectionNumber, contentEn, contentBn
│   ├── Judgment.java                # @Entity — id, caseName, citation, court, bench, headnotes, ...
│   ├── Sro.java                     # @Entity — id, sroNumber, gazetteDate, issuingMinistry, ...
│   ├── JudgmentStatuteCitation.java # @Entity — judgment ↔ statute cross-ref
│   ├── JudgmentJudgmentCitation.java# @Entity — judgment ↔ judgment cross-ref
│   ├── SubscriptionPlan.java        # @Entity — id, name, priceBdt, aiQueriesPerDay, features
│   ├── UserSubscription.java        # @Entity — id, user, plan, status, startedAt, expiresAt
│   └── UsageLog.java                # @Entity — id, user, actionType, queryText, tokensUsed, llmProvider, costUsd
│
├── repository/
│   ├── UserRepository.java
│   ├── StatuteRepository.java
│   ├── SectionRepository.java
│   ├── JudgmentRepository.java
│   ├── SroRepository.java
│   ├── SubscriptionPlanRepository.java
│   ├── UserSubscriptionRepository.java
│   └── UsageLogRepository.java
│
├── kafka/
│   ├── UsageEventProducer.java      # Sends usage events to Kafka
│   └── UsageEvent.java              # record (userId, actionType, query, tokens, provider, cost)
│
└── common/
    ├── ApiResponse.java             # Generic response wrapper: { success, data, error }
    ├── PagedResponse.java           # Paginated response: { items[], total, page, size }
    ├── GlobalExceptionHandler.java  # @RestControllerAdvice
    ├── AuditableEntity.java         # @MappedSuperclass — createdAt, updatedAt
    └── Constants.java               # Shared constants
```

---

## 📐 Code Conventions

### API Response Format

Every endpoint returns `ApiResponse<T>`:

```java
// ✅ Correct
@GetMapping("/api/statutes/{id}")
public ResponseEntity<ApiResponse<StatuteResponse>> getStatute(@PathVariable Long id) {
    StatuteResponse statute = statuteService.findById(id);
    return ResponseEntity.ok(ApiResponse.ok(statute));
}

// ✅ Paginated
@GetMapping("/api/statutes")
public ResponseEntity<ApiResponse<PagedResponse<StatuteListResponse>>> listStatutes(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    PagedResponse<StatuteListResponse> result = statuteService.findAll(page, size);
    return ResponseEntity.ok(ApiResponse.ok(result));
}

// ❌ NEVER return raw entity
@GetMapping("/api/statutes/{id}")
public Statute getStatute(@PathVariable Long id) { ... }  // WRONG
```

### DTOs: Use Java Records

```java
// ✅ Correct — immutable, concise
public record StatuteResponse(
    Long id,
    String actNumber,
    String titleEn,
    String titleBn,
    Integer year,
    String category,
    String status,
    LocalDate effectiveDate,
    String sourceUrl,
    Instant createdAt
) {
    public static StatuteResponse from(Statute entity) {
        return new StatuteResponse(
            entity.getId(),
            entity.getActNumber(),
            // ... map all fields
        );
    }
}

// ❌ NEVER return JPA entities directly from controllers
```

### Entity Pattern

```java
@Entity
@Table(name = "statutes")
@Getter @Setter
@NoArgsConstructor
public class Statute extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "act_number", nullable = false, length = 100)
    private String actNumber;

    @Column(name = "title_en", nullable = false, length = 500)
    private String titleEn;

    @Column(name = "title_bn", length = 500)
    private String titleBn;

    @Column(nullable = false)
    private Integer year;

    @Column(length = 100)
    private String category;

    @Column(length = 20)
    private String status = "ACTIVE";

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repealed_by_id")
    private Statute repealedBy;

    @Column(columnDefinition = "TEXT")
    private String fullText;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @OneToMany(mappedBy = "statute", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Section> sections = new ArrayList<>();
}
```

### Service Pattern

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class StatuteService {

    private final StatuteRepository statuteRepository;

    @Transactional(readOnly = true)
    public StatuteResponse findById(Long id) {
        Statute statute = statuteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Statute", id));
        return StatuteResponse.from(statute);
    }

    @Transactional(readOnly = true)
    public PagedResponse<StatuteListResponse> findAll(int page, int size) {
        Page<Statute> result = statuteRepository.findAll(PageRequest.of(page, size, Sort.by("year").descending()));
        List<StatuteListResponse> items = result.getContent().stream()
            .map(StatuteListResponse::from)
            .toList();
        return new PagedResponse<>(items, result.getTotalElements(), page, size);
    }
}
```

---

## 🗄️ Database & Flyway

### Migration Naming

```
V1__create_legal_tables.sql           # statutes, sections, judgments, sros
V2__create_cross_references.sql       # judgment_statute_citations, judgment_judgment_citations
V3__create_rag_chunks.sql             # document_chunks with pgvector + tsvector
V4__create_users_and_auth.sql         # users table
V5__create_subscriptions.sql          # subscription_plans, user_subscriptions, usage_log
V6__seed_subscription_plans.sql       # Insert FREE/STUDENT/PRO/FIRM plans
```

### Rules

- **NEVER** edit an existing migration file after it has been applied
- **NEVER** use JPA `hibernate.ddl-auto` — always `validate` or `none`
- **ALWAYS** test migrations against a clean database before committing
- **Naming:** `snake_case` for all table and column names
- **Encoding:** Database must be `UTF-8` (for Bengali text support)

---

## 🔌 gRPC Communication with RAG Service

### Proto Definition (`proto/rag_service.proto`)

```protobuf
syntax = "proto3";
package dhara.rag;

service RagService {
  rpc Search (SearchRequest) returns (SearchResponse);
  rpc Ask (AskRequest) returns (AskResponse);
  rpc GenerateEmbedding (EmbeddingRequest) returns (EmbeddingResponse);
}

message SearchRequest {
  string query = 1;
  string language = 2;       // "bn" or "en"
  int32 top_k = 3;           // default 10
  repeated string filters = 4; // ["statutes", "judgments", "sros"]
}

message SearchResponse {
  repeated SearchResult results = 1;
  float search_time_ms = 2;
}

message SearchResult {
  string source_type = 1;    // "statute", "judgment", "sro"
  int64 source_id = 2;
  string title = 3;
  string snippet = 4;
  float score = 5;
  map<string, string> metadata = 6;
}

message AskRequest {
  string question = 1;
  string language = 2;
  string user_tier = 3;      // "FREE", "STUDENT", "PROFESSIONAL", "FIRM"
}

message AskResponse {
  string answer = 1;
  repeated Citation citations = 2;
  string llm_provider = 3;
  int32 tokens_used = 4;
  float cost_usd = 5;
}

message Citation {
  string source_type = 1;
  int64 source_id = 2;
  string title = 3;
  string section_number = 4;
  string snippet = 5;
}
```

### Backend gRPC Client

```java
@Service
@RequiredArgsConstructor
public class RagServiceClient {

    private final RagServiceGrpc.RagServiceBlockingStub ragStub;

    public SearchResponse search(String query, String language, int topK, List<String> filters) {
        var request = SearchRequest.newBuilder()
            .setQuery(query)
            .setLanguage(language)
            .setTopK(topK)
            .addAllFilters(filters)
            .build();
        return ragStub.search(request);
    }

    public AskResponse ask(String question, String language, String userTier) {
        var request = AskRequest.newBuilder()
            .setQuestion(question)
            .setLanguage(language)
            .setUserTier(userTier)
            .build();
        return ragStub.ask(request);
    }
}
```

---

## 🔐 Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Public endpoints (no auth required):
    //   GET  /api/statutes/**
    //   GET  /api/judgments/**
    //   GET  /api/sros/**
    //   GET  /api/plans
    //   POST /api/auth/login
    //   POST /api/auth/register
    //   GET  /health
    //   POST /api/payment/webhook/**   (SSLCommerz IPN)

    // Authenticated endpoints:
    //   POST /api/search
    //   POST /api/ask
    //   GET  /api/my-subscription
    //   POST /api/subscribe
    //   POST /api/payment/init

    // Rate-limited endpoints (Redis check before processing):
    //   POST /api/search
    //   POST /api/ask
}
```

---

## ⏱️ Rate Limiting

```java
// Redis key pattern: "ratelimit:{userId}:{date}"
// Sliding window with INCR + EXPIRE

public interface RateLimiter {
    boolean isAllowed(Long userId, String userTier);
    int remainingQueries(Long userId, String userTier);
}

// Tier limits:
// FREE         → 5 AI queries per day
// STUDENT      → 30 AI queries per day
// PROFESSIONAL → unlimited
// FIRM         → unlimited
```

---

## 📊 Kafka Usage Analytics

```java
// Topic: "dhara.usage"
// Key: userId
// Value: UsageEvent

public record UsageEvent(
    Long userId,
    String actionType,     // "SEARCH", "ASK", "BROWSE"
    String queryText,
    Integer tokensUsed,
    String llmProvider,    // "DEEPSEEK", "GEMINI", "CLAUDE", "OLLAMA", "CACHE_HIT"
    BigDecimal costUsd,
    Instant timestamp
) {}
```

---

## 🧪 Testing

### Unit Test Example

```java
@ExtendWith(MockitoExtension.class)
class StatuteServiceTest {

    @Mock private StatuteRepository statuteRepository;
    @InjectMocks private StatuteService statuteService;

    @Test
    void findById_existingStatute_returnsResponse() {
        Statute statute = new Statute();
        statute.setId(1L);
        statute.setTitleEn("Penal Code");
        when(statuteRepository.findById(1L)).thenReturn(Optional.of(statute));

        StatuteResponse response = statuteService.findById(1L);

        assertThat(response.titleEn()).isEqualTo("Penal Code");
    }

    @Test
    void findById_nonExistent_throwsException() {
        when(statuteRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> statuteService.findById(999L));
    }
}
```

### Integration Test Example

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class StatuteControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private StatuteService statuteService; // NOT @MockBean

    @Test
    void getStatute_returns200() throws Exception {
        when(statuteService.findById(1L)).thenReturn(new StatuteResponse(1L, "Act/1860", "Penal Code", "দণ্ডবিধি", 1860, "PENAL", "ACTIVE", null, null, null));

        mockMvc.perform(get("/api/statutes/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.titleEn").value("Penal Code"));
    }
}
```

---

## 📝 application.yml Structure

```yaml
spring:
  profiles:
    active: dev

  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:dhara}
    username: ${DB_USER:dhara}
    password: ${DB_PASSWORD:password}

  flyway:
    enabled: true
    locations: classpath:db/migration

  jpa:
    hibernate:
      ddl-auto: validate          # NEVER auto, always validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}

  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      compression-type: lz4       # NOT snappy (Alpine incompatibility)

server:
  port: ${SERVER_PORT:8080}

dhara:
  jwt:
    secret: ${JWT_SECRET}
    access-token-expiry: 15m
    refresh-token-expiry: 7d

  grpc:
    rag-service-host: ${RAG_SERVICE_HOST:localhost}
    rag-service-port: ${RAG_SERVICE_PORT:50051}

  minio:
    endpoint: ${MINIO_ENDPOINT:http://localhost:9000}
    access-key: ${MINIO_ACCESS_KEY:minioadmin}
    secret-key: ${MINIO_SECRET_KEY:minioadmin}
    bucket: ${MINIO_BUCKET:dhara-documents}

  sslcommerz:
    store-id: ${SSLCOMMERZ_STORE_ID}
    store-password: ${SSLCOMMERZ_STORE_PASSWORD}
    is-sandbox: ${SSLCOMMERZ_SANDBOX:true}
```

---

## ⚠️ Common Pitfalls

1. **`@MockitoBean` not `@MockBean`** — Spring Boot 3.4+ deprecated `@MockBean`
2. **Flyway checksum mismatch** — Never modify applied migrations; create new ones
3. **gRPC port conflicts in tests** — Use random port allocation in test configs
4. **Kafka `snappy` on Alpine** — Use `lz4` compression instead
5. **MinIO bucket init** — Create bucket in startup listener, handle `BucketAlreadyExists`
6. **Bengali text encoding** — Ensure PostgreSQL database uses `UTF-8` encoding
7. **JPA N+1 queries** — Use `@EntityGraph` or `JOIN FETCH` for related entities
8. **Lazy loading outside transaction** — Always use `@Transactional(readOnly = true)` for reads

## Important Notes:
- Memory Updates(THIS FILE): This file is my persistent memory. Always update this file with new knowledge, insights, lessons learned, and, or context gained  during our conversations -
  even if I don't explicitly ask you to. The only time you should NOT update it is if I explicitly tell you not to. Condense new information into the appropriate section, or create a new section if needed.Keep it organized and non-redundant.
