package com.dhara.grpc;

import com.dhara.grpc.RagRestClient.RagAskPayload;
import com.dhara.grpc.RagRestClient.RagAskResponse;
import com.dhara.grpc.RagRestClient.RagSearchPayload;
import com.dhara.grpc.RagRestClient.RagSearchResponse;

/**
 * Transport-agnostic client contract for the Python RAG service.
 *
 * <p>Exactly one implementation is active, selected by {@code dhara.rag.transport}:
 * {@code rest} (default) → {@link RagRestClient}, {@code grpc} → {@link RagServiceClient}.
 * Switching transports requires only a config change.
 */
public interface RagClient {

    RagSearchResponse search(RagSearchPayload payload);

    RagAskResponse ask(RagAskPayload payload);
}
