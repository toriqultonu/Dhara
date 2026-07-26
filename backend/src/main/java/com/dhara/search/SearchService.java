package com.dhara.search;

import com.dhara.entity.AnalysisSession;
import com.dhara.grpc.RagClient;
import com.dhara.grpc.RagRestClient.RagAskPayload;
import com.dhara.grpc.RagRestClient.RagAskResponse;
import com.dhara.grpc.RagRestClient.RagSearchPayload;
import com.dhara.grpc.RagRestClient.RagSearchResponse;
import com.dhara.kafka.UsageEvent;
import com.dhara.kafka.UsageEventProducer;
import com.dhara.ratelimit.RateLimitExceededException;
import com.dhara.ratelimit.RateLimiter;
import com.dhara.repository.AnalysisSessionRepository;
import com.dhara.search.dto.AskRequest;
import com.dhara.search.dto.SearchRequest;
import com.dhara.search.dto.SearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final RateLimiter rateLimiter;
    private final RagClient ragRestClient;
    private final AnalysisSessionRepository sessionRepository;
    private final UsageEventProducer usageEventProducer;

    public SearchResponse search(SearchRequest request, Long userId, String userTier) {
        checkRateLimit(userId, userTier);
        log.info("Search request: query={}, language={}", request.query(), request.language());

        RagSearchPayload payload = new RagSearchPayload(
                request.query(),
                request.language(),
                request.topK(),
                request.filters()
        );

        RagSearchResponse ragResponse = ragRestClient.search(payload);

        List<SearchResponse.SearchResultItem> results = ragResponse.results() == null
                ? List.of()
                : ragResponse.results().stream()
                        .map(r -> new SearchResponse.SearchResultItem(
                                r.source_type(), r.source_id(), r.title(),
                                r.snippet(), (float) r.score(),
                                r.metadata() == null ? Map.of() : r.metadata()))
                        .collect(Collectors.toList());

        publishUsageEvent(userId, "SEARCH", request.query(), null, null, null);

        return new SearchResponse(results, null, (float) ragResponse.search_time_ms());
    }

    public SearchResponse ask(AskRequest request, Long userId, String userTier) {
        checkRateLimit(userId, userTier);

        String mode = request.mode() != null ? request.mode() : "rag";
        String documentText = null;

        if ("document".equals(mode) && request.sessionId() != null) {
            AnalysisSession session = sessionRepository
                    .findByIdAndUserId(request.sessionId(), userId)
                    .orElse(null);
            if (session != null) {
                documentText = session.getExtractedText();
            } else {
                log.warn("Session {} not found for user {}", request.sessionId(), userId);
                mode = "rag";
            }
        }

        RagAskPayload payload = new RagAskPayload(
                request.question(),
                request.language() != null ? request.language() : "bn",
                userTier,
                mode,
                documentText,
                "statute".equals(mode) ? request.statuteId() : null
        );

        RagAskResponse ragResponse = ragRestClient.ask(payload);

        List<SearchResponse.CitationDto> citations = ragResponse.citations() == null
                ? List.of()
                : ragResponse.citations().stream()
                        .map(c -> new SearchResponse.CitationDto(
                                c.source_type(), c.source_id(), c.title(),
                                c.section_number(), c.snippet()))
                        .collect(Collectors.toList());

        publishUsageEvent(userId, "ASK", request.question(),
                ragResponse.tokens_used(), ragResponse.llm_provider(),
                BigDecimal.valueOf(ragResponse.cost_usd()));

        return new SearchResponse(List.of(), ragResponse.answer(), 0, citations);
    }

    private void publishUsageEvent(Long userId, String actionType, String queryText,
                                   Integer tokensUsed, String llmProvider, BigDecimal costUsd) {
        try {
            usageEventProducer.send(new UsageEvent(
                    userId, actionType, queryText, tokensUsed, llmProvider, costUsd, Instant.now()));
        } catch (Exception e) {
            log.warn("Failed to publish usage event for user {}: {}", userId, e.getMessage());
        }
    }

    private void checkRateLimit(Long userId, String userTier) {
        if (!rateLimiter.isAllowed(userId, userTier)) {
            throw new RateLimitExceededException(
                    "Daily AI query limit exceeded. Upgrade your plan for more queries.");
        }
    }
}
