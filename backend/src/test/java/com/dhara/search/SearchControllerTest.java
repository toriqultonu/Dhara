package com.dhara.search;

import com.dhara.auth.JwtService;
import com.dhara.ratelimit.RateLimitExceededException;
import com.dhara.search.dto.AskRequest;
import com.dhara.search.dto.SearchRequest;
import com.dhara.search.dto.SearchResponse;
import com.dhara.subscription.SubscriptionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = SearchController.class)
@AutoConfigureMockMvc(addFilters = false)
class SearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SearchService searchService;

    @MockitoBean
    private SubscriptionService subscriptionService;

    @MockitoBean
    private JwtService jwtService; // required by the component-scanned JwtAuthFilter

    private Authentication userAuth() {
        return new UsernamePasswordAuthenticationToken(
                "42", null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    @Test
    void search_authenticatedUser_resolvesTierAndReturnsResults() throws Exception {
        when(subscriptionService.getUserTier(42L)).thenReturn("PROFESSIONAL");
        SearchResponse response = new SearchResponse(
                List.of(new SearchResponse.SearchResultItem(
                        "statute", 1L, "Contract Act 1872", "snippet", 0.9f, Map.of())),
                null, 12.5f);
        when(searchService.search(any(SearchRequest.class), eq(42L), eq("PROFESSIONAL")))
                .thenReturn(response);

        mockMvc.perform(post("/api/search")
                        .principal(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"query\":\"contract law\",\"language\":\"en\",\"topK\":5}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.results[0].title").value("Contract Act 1872"))
                .andExpect(jsonPath("$.data.searchTimeMs").value(12.5));

        verify(subscriptionService).getUserTier(42L);
    }

    @Test
    void search_blankQuery_returns400ValidationError() throws Exception {
        mockMvc.perform(post("/api/search")
                        .principal(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"query\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void ask_authenticatedUser_returnsAnswerWithCitations() throws Exception {
        when(subscriptionService.getUserTier(42L)).thenReturn("FREE");
        SearchResponse response = new SearchResponse(
                List.of(), "A contract requires offer and acceptance.", 0,
                List.of(new SearchResponse.CitationDto(
                        "statute", 1L, "Contract Act 1872", "10", "snippet")));
        when(searchService.ask(any(AskRequest.class), eq(42L), eq("FREE"))).thenReturn(response);

        mockMvc.perform(post("/api/ask")
                        .principal(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"What makes a contract valid?\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.aiAnswer").value("A contract requires offer and acceptance."))
                .andExpect(jsonPath("$.data.citations[0].sectionNumber").value("10"));
    }

    @Test
    void ask_rateLimitExceeded_returns429() throws Exception {
        when(subscriptionService.getUserTier(42L)).thenReturn("FREE");
        when(searchService.ask(any(AskRequest.class), eq(42L), eq("FREE")))
                .thenThrow(new RateLimitExceededException("Daily AI query limit exceeded."));

        mockMvc.perform(post("/api/ask")
                        .principal(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"Another question\"}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Daily AI query limit exceeded."));
    }
}
