package com.dhara.config;

import com.dhara.grpc.RagServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcConfig {

    @Value("${dhara.grpc.rag-service-host:localhost}")
    private String ragServiceHost;

    @Value("${dhara.grpc.rag-service-port:50051}")
    private int ragServicePort;

    @Bean(destroyMethod = "shutdown")
    public ManagedChannel ragServiceChannel() {
        return ManagedChannelBuilder
                .forAddress(ragServiceHost, ragServicePort)
                .usePlaintext()
                .build();
    }

    @Bean
    public RagServiceGrpc.RagServiceBlockingStub ragServiceBlockingStub(ManagedChannel ragServiceChannel) {
        return RagServiceGrpc.newBlockingStub(ragServiceChannel);
    }
}
