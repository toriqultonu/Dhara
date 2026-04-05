package com.dhara.search;

import com.dhara.ratelimit.RateLimitExceededException;
import com.dhara.ratelimit.RateLimiter;
import com.dhara.search.dto.AskRequest;
import com.dhara.search.dto.SearchRequest;
import com.dhara.search.dto.SearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final RateLimiter rateLimiter;
    // TODO: Inject RagServiceClient once gRPC stubs are compiled
    // private final RagServiceClient ragServiceClient;

    public SearchResponse search(SearchRequest request, Long userId, String userTier) {
        checkRateLimit(userId, userTier);
        // TODO: Call RAG service via gRPC
        log.info("Search request: query={}, language={}", request.query(), request.language());
        return new SearchResponse(java.util.List.of(), null, 0);
    }

    public SearchResponse ask(AskRequest request, Long userId, String userTier) {
        checkRateLimit(userId, userTier);
        // TODO: Call RAG service via gRPC
        log.info("Ask request: question={}, language={}", request.question(), request.language());
        return new SearchResponse(java.util.List.of(), null, 0);
    }

    private void checkRateLimit(Long userId, String userTier) {
        if (!rateLimiter.isAllowed(userId, userTier)) {
            throw new RateLimitExceededException(
                    "Daily AI query limit exceeded. Upgrade your plan for more queries.");
        }
    }
}
