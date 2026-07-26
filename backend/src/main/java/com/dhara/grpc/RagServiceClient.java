package com.dhara.grpc;

import com.dhara.grpc.RagRestClient.RagAskPayload;
import com.dhara.grpc.RagRestClient.RagAskResponse;
import com.dhara.grpc.RagRestClient.RagCitation;
import com.dhara.grpc.RagRestClient.RagSearchPayload;
import com.dhara.grpc.RagRestClient.RagSearchResponse;
import com.dhara.grpc.RagRestClient.RagSearchResult;
import io.grpc.ManagedChannel;
import io.grpc.StatusRuntimeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * gRPC client for the Python RAG service, backed by the generated protobuf
 * stubs from {@code src/main/proto/rag_service.proto}.
 * Active when {@code dhara.rag.transport=grpc}.
 *
 * <p>Channel and blocking stub come from {@link com.dhara.config.GrpcConfig},
 * configured via {@code dhara.grpc.rag-service-host} / {@code dhara.grpc.rag-service-port}.
 * On transport failure the client degrades gracefully (same behavior as
 * {@link RagRestClient}) instead of propagating {@link StatusRuntimeException}.
 */
@Component
@ConditionalOnProperty(prefix = "dhara.rag", name = "transport", havingValue = "grpc")
public class RagServiceClient implements RagClient {

    private static final Logger log = LoggerFactory.getLogger(RagServiceClient.class);

    private final ManagedChannel channel;
    private final RagServiceGrpc.RagServiceBlockingStub stub;
    private final long deadlineSeconds;

    public RagServiceClient(
            ManagedChannel ragServiceChannel,
            RagServiceGrpc.RagServiceBlockingStub ragServiceBlockingStub,
            @Value("${dhara.grpc.deadline-seconds:60}") long deadlineSeconds) {
        this.channel = ragServiceChannel;
        this.stub = ragServiceBlockingStub;
        this.deadlineSeconds = deadlineSeconds;
    }

    @Override
    public RagSearchResponse search(RagSearchPayload payload) {
        log.info("gRPC search to RAG service: query={}, topK={}", payload.query(), payload.top_k());

        com.dhara.grpc.SearchRequest grpcRequest = com.dhara.grpc.SearchRequest.newBuilder()
                .setQuery(payload.query())
                .setLanguage(payload.language() != null ? payload.language() : "bn")
                .setTopK(payload.top_k())
                .addAllFilters(payload.filters() != null ? payload.filters() : List.of())
                .build();

        try {
            com.dhara.grpc.SearchResponse grpcResponse = stub
                    .withDeadlineAfter(deadlineSeconds, TimeUnit.SECONDS)
                    .search(grpcRequest);

            List<RagSearchResult> results = grpcResponse.getResultsList().stream()
                    .map(r -> new RagSearchResult(
                            r.getSourceType(),
                            r.getSourceId(),
                            r.getTitle(),
                            r.getSnippet(),
                            r.getScore(),
                            r.getMetadataMap()))
                    .toList();

            return new RagSearchResponse(results, grpcResponse.getSearchTimeMs());
        } catch (StatusRuntimeException e) {
            log.error("gRPC search failed: status={}, message={}", e.getStatus(), e.getMessage());
            return new RagSearchResponse(List.of(), 0.0);
        }
    }

    @Override
    public RagAskResponse ask(RagAskPayload payload) {
        log.info("gRPC ask to RAG service: mode={}, question={}", payload.mode(), payload.question());

        com.dhara.grpc.AskRequest.Builder builder = com.dhara.grpc.AskRequest.newBuilder()
                .setQuestion(payload.question())
                .setLanguage(payload.language() != null ? payload.language() : "bn")
                .setUserTier(payload.user_tier() != null ? payload.user_tier() : "FREE")
                .setMode(payload.mode() != null ? payload.mode() : "rag");
        if (payload.document_text() != null) {
            builder.setDocumentText(payload.document_text());
        }
        if (payload.statute_id() != null) {
            builder.setStatuteId(payload.statute_id());
        }

        try {
            com.dhara.grpc.AskResponse grpcResponse = stub
                    .withDeadlineAfter(deadlineSeconds, TimeUnit.SECONDS)
                    .ask(builder.build());

            List<RagCitation> citations = grpcResponse.getCitationsList().stream()
                    .map(c -> new RagCitation(
                            c.getSourceType(),
                            c.getSourceId(),
                            c.getTitle(),
                            c.getSectionNumber(),
                            c.getSnippet()))
                    .toList();

            return new RagAskResponse(
                    grpcResponse.getAnswer(),
                    citations,
                    grpcResponse.getLlmProvider(),
                    grpcResponse.getLlmModel(),
                    grpcResponse.getTokensUsed(),
                    grpcResponse.getCostUsd());
        } catch (StatusRuntimeException e) {
            log.error("gRPC ask failed: status={}, message={}", e.getStatus(), e.getMessage());
            return new RagAskResponse(
                    "RAG service unavailable. Please ensure the RAG service is running.",
                    List.of(), "none", "none", 0, 0.0);
        }
    }

    public boolean isHealthy() {
        try {
            return !channel.isShutdown() && !channel.isTerminated();
        } catch (Exception e) {
            log.warn("RAG service health check failed", e);
            return false;
        }
    }
}
