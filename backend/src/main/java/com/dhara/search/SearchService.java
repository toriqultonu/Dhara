package com.dhara.search;

import com.dhara.entity.AnalysisSession;
import com.dhara.grpc.RagRestClient;
import com.dhara.grpc.RagRestClient.RagAskPayload;
import com.dhara.grpc.RagRestClient.RagAskResponse;
import com.dhara.ratelimit.RateLimitExceededException;
import com.dhara.ratelimit.RateLimiter;
import com.dhara.repository.AnalysisSessionRepository;
import com.dhara.search.dto.AskRequest;
import com.dhara.search.dto.SearchRequest;
import com.dhara.search.dto.SearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final RateLimiter rateLimiter;
    private final RagRestClient ragRestClient;
    private final AnalysisSessionRepository sessionRepository;

    public SearchResponse search(SearchRequest request, Long userId, String userTier) {
        checkRateLimit(userId, userTier);
        log.info("Search request: query={}, language={}", request.query(), request.language());
        // TODO: Call RAG service /search endpoint
        return new SearchResponse(List.of(), null, 0);
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

        return new SearchResponse(List.of(), ragResponse.answer(), 0, citations);
    }

    private void checkRateLimit(Long userId, String userTier) {
        if (!rateLimiter.isAllowed(userId, userTier)) {
            throw new RateLimitExceededException(
                    "Daily AI query limit exceeded. Upgrade your plan for more queries.");
        }
    }
}
