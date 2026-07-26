package com.dhara.search;

import com.dhara.entity.AnalysisSession;
import com.dhara.grpc.RagRestClient;
import com.dhara.grpc.RagRestClient.RagAskPayload;
import com.dhara.grpc.RagRestClient.RagAskResponse;
import com.dhara.grpc.RagRestClient.RagCitation;
import com.dhara.grpc.RagRestClient.RagSearchPayload;
import com.dhara.grpc.RagRestClient.RagSearchResponse;
import com.dhara.grpc.RagRestClient.RagSearchResult;
import com.dhara.kafka.UsageEvent;
import com.dhara.kafka.UsageEventProducer;
import com.dhara.ratelimit.RateLimitExceededException;
import com.dhara.ratelimit.RateLimiter;
import com.dhara.repository.AnalysisSessionRepository;
import com.dhara.search.dto.AskRequest;
import com.dhara.search.dto.SearchRequest;
import com.dhara.search.dto.SearchResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    private static final Long USER_ID = 42L;
    private static final String TIER = "FREE";

    @Mock
    private RateLimiter rateLimiter;

    @Mock
    private RagRestClient ragRestClient;

    @Mock
    private AnalysisSessionRepository sessionRepository;

    @Mock
    private UsageEventProducer usageEventProducer;

    @InjectMocks
    private SearchService searchService;

    private SearchRequest searchRequest;

    @BeforeEach
    void setUp() {
        searchRequest = new SearchRequest("contract law", "en", List.of("statutes"), 5);
    }

    @Test
    void search_ragReturnsResults_mapsToSearchResponse() {
        when(rateLimiter.isAllowed(USER_ID, TIER)).thenReturn(true);
        RagSearchResult result = new RagSearchResult(
                "statute", 1L, "Contract Act 1872", "An agreement enforceable by law...",
                0.92, Map.of("year", "1872"));
        when(ragRestClient.search(any(RagSearchPayload.class)))
                .thenReturn(new RagSearchResponse(List.of(result), 34.5));

        SearchResponse response = searchService.search(searchRequest, USER_ID, TIER);

        assertThat(response.results()).hasSize(1);
        SearchResponse.SearchResultItem item = response.results().get(0);
        assertThat(item.sourceType()).isEqualTo("statute");
        assertThat(item.sourceId()).isEqualTo(1L);
        assertThat(item.title()).isEqualTo("Contract Act 1872");
        assertThat(item.score()).isEqualTo(0.92f);
        assertThat(item.metadata()).containsEntry("year", "1872");
        assertThat(response.searchTimeMs()).isEqualTo(34.5f);
        assertThat(response.aiAnswer()).isNull();
    }

    @Test
    void search_nullResultsFromRag_returnsEmptyList() {
        when(rateLimiter.isAllowed(USER_ID, TIER)).thenReturn(true);
        when(ragRestClient.search(any(RagSearchPayload.class)))
                .thenReturn(new RagSearchResponse(null, 0.0));

        SearchResponse response = searchService.search(searchRequest, USER_ID, TIER);

        assertThat(response.results()).isEmpty();
    }

    @Test
    void search_success_publishesUsageEvent() {
        when(rateLimiter.isAllowed(USER_ID, TIER)).thenReturn(true);
        when(ragRestClient.search(any(RagSearchPayload.class)))
                .thenReturn(new RagSearchResponse(List.of(), 1.0));

        searchService.search(searchRequest, USER_ID, TIER);

        ArgumentCaptor<UsageEvent> captor = ArgumentCaptor.forClass(UsageEvent.class);
        verify(usageEventProducer).send(captor.capture());
        assertThat(captor.getValue().userId()).isEqualTo(USER_ID);
        assertThat(captor.getValue().actionType()).isEqualTo("SEARCH");
        assertThat(captor.getValue().queryText()).isEqualTo("contract law");
    }

    @Test
    void search_kafkaProducerThrows_doesNotPropagate() {
        when(rateLimiter.isAllowed(USER_ID, TIER)).thenReturn(true);
        when(ragRestClient.search(any(RagSearchPayload.class)))
                .thenReturn(new RagSearchResponse(List.of(), 1.0));
        doThrow(new RuntimeException("kafka down")).when(usageEventProducer).send(any(UsageEvent.class));

        SearchResponse response = searchService.search(searchRequest, USER_ID, TIER);

        assertThat(response).isNotNull();
    }

    @Test
    void search_rateLimitExceeded_throwsAndSkipsRagCall() {
        when(rateLimiter.isAllowed(USER_ID, TIER)).thenReturn(false);

        assertThatThrownBy(() -> searchService.search(searchRequest, USER_ID, TIER))
                .isInstanceOf(RateLimitExceededException.class);

        verify(ragRestClient, never()).search(any());
        verify(usageEventProducer, never()).send(any());
    }

    @Test
    void ask_happyPath_returnsAnswerWithCitations() {
        when(rateLimiter.isAllowed(USER_ID, TIER)).thenReturn(true);
        RagCitation citation = new RagCitation("statute", 1L, "Contract Act 1872", "10", "snippet text");
        when(ragRestClient.ask(any(RagAskPayload.class))).thenReturn(new RagAskResponse(
                "A contract requires offer and acceptance.", List.of(citation),
                "ollama", "llama3", 250, 0.001));

        AskRequest request = new AskRequest("What makes a contract valid?", "en", null, null, null);
        SearchResponse response = searchService.ask(request, USER_ID, TIER);

        assertThat(response.aiAnswer()).isEqualTo("A contract requires offer and acceptance.");
        assertThat(response.citations()).hasSize(1);
        assertThat(response.citations().get(0).title()).isEqualTo("Contract Act 1872");
        assertThat(response.citations().get(0).sectionNumber()).isEqualTo("10");

        ArgumentCaptor<UsageEvent> captor = ArgumentCaptor.forClass(UsageEvent.class);
        verify(usageEventProducer).send(captor.capture());
        assertThat(captor.getValue().actionType()).isEqualTo("ASK");
        assertThat(captor.getValue().tokensUsed()).isEqualTo(250);
        assertThat(captor.getValue().llmProvider()).isEqualTo("ollama");
    }

    @Test
    void ask_documentModeWithExistingSession_sendsExtractedText() {
        when(rateLimiter.isAllowed(USER_ID, TIER)).thenReturn(true);
        AnalysisSession session = new AnalysisSession();
        session.setId("abc123");
        session.setExtractedText("Employment agreement full text");
        when(sessionRepository.findByIdAndUserId("abc123", USER_ID)).thenReturn(Optional.of(session));
        when(ragRestClient.ask(any(RagAskPayload.class))).thenReturn(
                new RagAskResponse("answer", List.of(), "ollama", "llama3", 10, 0.0));

        AskRequest request = new AskRequest("Summarize", "en", "document", "abc123", null);
        searchService.ask(request, USER_ID, TIER);

        ArgumentCaptor<RagAskPayload> captor = ArgumentCaptor.forClass(RagAskPayload.class);
        verify(ragRestClient).ask(captor.capture());
        assertThat(captor.getValue().mode()).isEqualTo("document");
        assertThat(captor.getValue().document_text()).isEqualTo("Employment agreement full text");
    }

    @Test
    void ask_documentModeSessionMissing_fallsBackToRagMode() {
        when(rateLimiter.isAllowed(USER_ID, TIER)).thenReturn(true);
        when(sessionRepository.findByIdAndUserId("missing", USER_ID)).thenReturn(Optional.empty());
        when(ragRestClient.ask(any(RagAskPayload.class))).thenReturn(
                new RagAskResponse("answer", List.of(), "ollama", "llama3", 10, 0.0));

        AskRequest request = new AskRequest("Summarize", "en", "document", "missing", null);
        searchService.ask(request, USER_ID, TIER);

        ArgumentCaptor<RagAskPayload> captor = ArgumentCaptor.forClass(RagAskPayload.class);
        verify(ragRestClient).ask(captor.capture());
        assertThat(captor.getValue().mode()).isEqualTo("rag");
        assertThat(captor.getValue().document_text()).isNull();
    }

    @Test
    void ask_rateLimitExceeded_throws() {
        when(rateLimiter.isAllowed(USER_ID, TIER)).thenReturn(false);

        AskRequest request = new AskRequest("Question", null, null, null, null);
        assertThatThrownBy(() -> searchService.ask(request, USER_ID, TIER))
                .isInstanceOf(RateLimitExceededException.class);

        verify(ragRestClient, never()).ask(any());
    }
}
