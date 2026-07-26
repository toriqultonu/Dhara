package com.dhara.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI dharaOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Dhara API")
                        .version("0.1.0")
                        .description("AI-powered legal research platform for Bangladesh. "
                                + "Natural language search (Bangla + English) across statutes, "
                                + "case law, and SROs with AI-generated answers backed by citations.")
                        .contact(new Contact().name("Dhara Team")))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT access token from /api/auth/login")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH));
    }
}
