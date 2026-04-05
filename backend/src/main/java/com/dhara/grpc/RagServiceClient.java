package com.dhara.grpc;

import com.dhara.search.dto.AskRequest;
import com.dhara.search.dto.SearchRequest;
import com.dhara.search.dto.SearchResponse;
import io.grpc.ManagedChannel;
import io.grpc.StatusRuntimeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * gRPC client for communicating with the Python RAG service.
 * In production, this uses generated protobuf stubs.
 * Currently provides a structured interface for when gRPC stubs are generated.
 */
@Component
public class RagServiceClient {

    private static final Logger log = LoggerFactory.getLogger(RagServiceClient.class);
    private final ManagedChannel channel;

    public RagServiceClient(ManagedChannel ragServiceChannel) {
        this.channel = ragServiceChannel;
    }

    public SearchResponse search(SearchRequest request, String userId, String userTier) {
        log.info("Sending search request to RAG service: query={}, userId={}", request.query(), userId);

        // TODO: Replace with generated gRPC stub call
        // RagServiceGrpc.RagServiceBlockingStub stub = RagServiceGrpc.newBlockingStub(channel);
        // var grpcRequest = com.dhara.grpc.SearchRequest.newBuilder()
        //     .setQuery(request.query())
        //     .setLimit(request.limit() != null ? request.limit() : 20)
        //     .setLanguage(request.language() != null ? request.language() : "bn")
        //     .setUserId(userId)
        //     .setUserTier(userTier)
        //     .build();
        // var grpcResponse = stub.search(grpcRequest);

        // Placeholder response until gRPC stubs are generated
        return new SearchResponse(List.of(), "", 0f);
    }

    public RagAskResponse ask(AskRequest request, String userId, String userTier) {
        log.info("Sending ask request to RAG service: question={}, userId={}", request.question(), userId);

        // TODO: Replace with generated gRPC stub call
        // Placeholder response
        return new RagAskResponse(
                "RAG service not yet connected. Please configure gRPC stubs.",
                List.of(),
                "none",
                0.0f,
                request.language() != null ? request.language() : "bn"
        );
    }

    public boolean isHealthy() {
        try {
            return !channel.isShutdown() && !channel.isTerminated();
        } catch (Exception e) {
            log.warn("RAG service health check failed", e);
            return false;
        }
    }

    public record RagAskResponse(
            String answer,
            List<RagCitation> citations,
            String modelUsed,
            float latencyMs,
            String language
    ) {}

    public record RagCitation(
            String docId,
            String docType,
            String title,
            String reference,
            String snippet,
            float relevanceScore
    ) {}
}
