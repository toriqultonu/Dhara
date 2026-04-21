package com.dhara.grpc;

import com.dhara.search.dto.SearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * HTTP REST client for the Python RAG service.
 * Used until gRPC proto stubs are generated.
 */
@Component
@Slf4j
public class RagRestClient {

    private final RestClient restClient;

    public RagRestClient(
            @Value("${dhara.rag.http-url:http://localhost:8000}") String ragBaseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(ragBaseUrl)
                .build();
    }

    public RagAskResponse ask(RagAskPayload payload) {
        log.info("Calling RAG service: mode={}, question={}", payload.mode(), payload.question());
        try {
            return restClient.post()
                    .uri("/ask")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(RagAskResponse.class);
        } catch (Exception e) {
            log.error("RAG service call failed: {}", e.getMessage());
            return new RagAskResponse(
                    "RAG service unavailable. Please ensure the RAG service is running.",
                    List.of(), "none", "none", 0, 0.0
            );
        }
    }

    public record RagAskPayload(
            String question,
            String language,
            String user_tier,
            String mode,
            String document_text,
            Long statute_id
    ) {}

    public record RagAskResponse(
            String answer,
            List<RagCitation> citations,
            String llm_provider,
            String llm_model,
            int tokens_used,
            double cost_usd
    ) {}

    public record RagCitation(
            String source_type,
            Long source_id,
            String title,
            String section_number,
            String snippet
    ) {}
}
