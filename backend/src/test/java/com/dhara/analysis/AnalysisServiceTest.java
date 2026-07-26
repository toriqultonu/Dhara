package com.dhara.analysis;

import com.dhara.analysis.dto.AnalysisQueryRequest;
import com.dhara.analysis.dto.AnalysisQueryResponse;
import com.dhara.analysis.dto.AnalysisUploadResponse;
import com.dhara.analysis.dto.VerifyRequest;
import com.dhara.analysis.dto.VerifyResponse;
import com.dhara.entity.AnalysisSession;
import com.dhara.entity.User;
import com.dhara.grpc.RagRestClient;
import com.dhara.grpc.RagRestClient.RagAskPayload;
import com.dhara.grpc.RagRestClient.RagAskResponse;
import com.dhara.grpc.RagRestClient.RagCitation;
import com.dhara.kafka.UsageEventProducer;
import com.dhara.repository.AnalysisSessionRepository;
import com.dhara.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalysisServiceTest {

    private static final Long USER_ID = 42L;

    @Mock
    private AnalysisSessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RagRestClient ragRestClient;

    @Mock
    private UsageEventProducer usageEventProducer;

    private AnalysisService analysisService;

    @BeforeEach
    void setUp() {
        analysisService = new AnalysisService(
                sessionRepository, userRepository, ragRestClient,
                usageEventProducer, new ObjectMapper());
    }

    private User user() {
        User u = new User();
        u.setId(USER_ID);
        return u;
    }

    private static byte[] tinyPdf(String text) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 12);
                cs.newLineAtOffset(50, 700);
                cs.showText(text);
                cs.endText();
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    // ── uploadDocument / extraction ────────────────────────────────────

    @Test
    void uploadDocument_realPdf_extractsTextAndSavesSession() throws IOException {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user()));
        byte[] pdf = tinyPdf("Employment agreement with a termination notice period clause");
        MockMultipartFile file = new MockMultipartFile(
                "file", "contract.pdf", "application/pdf", pdf);

        AnalysisUploadResponse response = analysisService.uploadDocument(USER_ID, file);

        assertThat(response.fileName()).isEqualTo("contract.pdf");
        assertThat(response.pageCount()).isEqualTo(1);
        assertThat(response.wordCount()).isGreaterThan(5);
        assertThat(response.extractedText()).contains("termination notice period");

        ArgumentCaptor<AnalysisSession> captor = ArgumentCaptor.forClass(AnalysisSession.class);
        verify(sessionRepository).save(captor.capture());
        AnalysisSession saved = captor.getValue();
        assertThat(saved.getId()).hasSize(16);
        assertThat(saved.getExtractedText()).contains("Employment agreement");
        assertThat(response.sessionId()).isEqualTo(saved.getId());
    }

    @Test
    void uploadDocument_txtFile_passesTextThrough() throws IOException {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user()));
        MockMultipartFile file = new MockMultipartFile(
                "file", "notes.txt", "text/plain",
                "Simple plain text notes".getBytes(StandardCharsets.UTF_8));

        AnalysisUploadResponse response = analysisService.uploadDocument(USER_ID, file);

        assertThat(response.extractedText()).isEqualTo("Simple plain text notes");
        assertThat(response.wordCount()).isEqualTo(4);
    }

    @Test
    void uploadDocument_oversizedFile_throwsIllegalArgument() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "huge.txt", "text/plain", new byte[10 * 1024 * 1024 + 1]);

        assertThatThrownBy(() -> analysisService.uploadDocument(USER_ID, file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("10 MB");
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void uploadDocument_corruptPdf_throwsIllegalArgumentWithSupportedFormats() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user()));
        MockMultipartFile file = new MockMultipartFile(
                "file", "broken.pdf", "application/pdf",
                "this is not a pdf".getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> analysisService.uploadDocument(USER_ID, file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Supported formats");
    }

    // ── queryDocument ──────────────────────────────────────────────────

    private AnalysisSession session() {
        AnalysisSession s = new AnalysisSession();
        s.setId("sess1234sess1234");
        s.setUser(user());
        s.setExtractedText("Employment agreement extracted text");
        return s;
    }

    @Test
    void queryDocument_ragReturnsCitations_highConfidence() {
        when(sessionRepository.findByIdAndUserId("sess1234sess1234", USER_ID))
                .thenReturn(Optional.of(session()));
        when(ragRestClient.ask(any(RagAskPayload.class))).thenReturn(new RagAskResponse(
                "The notice period is 120 days.",
                List.of(new RagCitation("statute", 1L, "Bangladesh Labour Act 2006", "20", "snippet")),
                "ollama", "llama3", 100, 0.002));

        AnalysisQueryResponse response = analysisService.queryDocument(USER_ID,
                new AnalysisQueryRequest("sess1234sess1234", "What is the notice period?", "en"));

        assertThat(response.answer()).isEqualTo("The notice period is 120 days.");
        assertThat(response.references()).hasSize(1);
        assertThat(response.references().get(0).law()).isEqualTo("Bangladesh Labour Act 2006");
        assertThat(response.confidence()).isEqualTo(0.85);
        verify(usageEventProducer).send(any());

        ArgumentCaptor<RagAskPayload> captor = ArgumentCaptor.forClass(RagAskPayload.class);
        verify(ragRestClient).ask(captor.capture());
        assertThat(captor.getValue().mode()).isEqualTo("document");
        assertThat(captor.getValue().document_text()).isEqualTo("Employment agreement extracted text");
    }

    @Test
    void queryDocument_ragAnswersWithoutCitations_mediumConfidence() {
        when(sessionRepository.findByIdAndUserId("sess1234sess1234", USER_ID))
                .thenReturn(Optional.of(session()));
        when(ragRestClient.ask(any(RagAskPayload.class))).thenReturn(new RagAskResponse(
                "General answer", List.of(), "ollama", "llama3", 50, 0.001));

        AnalysisQueryResponse response = analysisService.queryDocument(USER_ID,
                new AnalysisQueryRequest("sess1234sess1234", "Question", null));

        assertThat(response.confidence()).isEqualTo(0.6);
    }

    @Test
    void queryDocument_ragUnavailable_zeroConfidenceFallback() {
        when(sessionRepository.findByIdAndUserId("sess1234sess1234", USER_ID))
                .thenReturn(Optional.of(session()));
        when(ragRestClient.ask(any(RagAskPayload.class))).thenReturn(new RagAskResponse(
                "RAG service unavailable.", List.of(), "none", "none", 0, 0.0));

        AnalysisQueryResponse response = analysisService.queryDocument(USER_ID,
                new AnalysisQueryRequest("sess1234sess1234", "Question", null));

        assertThat(response.confidence()).isZero();
        assertThat(response.references()).isEmpty();
    }

    @Test
    void queryDocument_unknownSession_throwsResourceNotFound() {
        when(sessionRepository.findByIdAndUserId("missing", USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> analysisService.queryDocument(USER_ID,
                new AnalysisQueryRequest("missing", "Question", null)))
                .isInstanceOf(com.dhara.common.ResourceNotFoundException.class);
    }

    // ── verifyDocument ─────────────────────────────────────────────────

    @Test
    void verifyDocument_ragReturnsParseableJson_usesLlmVerification() {
        when(sessionRepository.findByIdAndUserId("sess1234sess1234", USER_ID))
                .thenReturn(Optional.of(session()));
        String answer = "Here is the verification: {\"valid\":[{\"section\":\"Working Hours\","
                + "\"text\":\"ok\",\"law\":\"Bangladesh Labour Act 2006\",\"lawSection\":\"100\","
                + "\"suggestion\":\"none\"}],\"warnings\":[],\"issues\":[{\"section\":\"Termination\","
                + "\"text\":\"missing\",\"law\":\"Bangladesh Labour Act 2006\",\"lawSection\":\"20\","
                + "\"suggestion\":\"add clause\"}]}";
        when(ragRestClient.ask(any(RagAskPayload.class))).thenReturn(new RagAskResponse(
                answer, List.of(), "ollama", "llama3", 300, 0.005));

        VerifyResponse response = analysisService.verifyDocument(USER_ID,
                new VerifyRequest("sess1234sess1234", "employment"));

        assertThat(response.documentType()).isEqualTo("employment");
        assertThat(response.summary().valid()).isEqualTo(1);
        assertThat(response.summary().warnings()).isZero();
        assertThat(response.summary().issues()).isEqualTo(1);
        assertThat(response.results().issues().get(0).section()).isEqualTo("Termination");
        verify(usageEventProducer).send(any());
    }

    @Test
    void verifyDocument_ragUnavailable_usesRuleBasedFallback() {
        AnalysisSession s = session();
        s.setExtractedText("This employment contract mentions nothing important.");
        when(sessionRepository.findByIdAndUserId("sess1234sess1234", USER_ID))
                .thenReturn(Optional.of(s));
        when(ragRestClient.ask(any(RagAskPayload.class))).thenReturn(new RagAskResponse(
                "RAG service unavailable.", List.of(), "none", "none", 0, 0.0));

        VerifyResponse response = analysisService.verifyDocument(USER_ID,
                new VerifyRequest("sess1234sess1234", "employment"));

        assertThat(response.documentType()).isEqualTo("employment");
        assertThat(response.results().issues())
                .anyMatch(item -> item.section().equals("Termination Clause"));
        assertThat(response.results().warnings())
                .anyMatch(item -> item.section().equals("Remuneration"));
        verify(usageEventProducer, never()).send(any());
    }

    @Test
    void verifyDocument_unparseableLlmAnswer_fallsBackToRuleBased() {
        when(sessionRepository.findByIdAndUserId("sess1234sess1234", USER_ID))
                .thenReturn(Optional.of(session()));
        when(ragRestClient.ask(any(RagAskPayload.class))).thenReturn(new RagAskResponse(
                "I cannot answer in JSON, sorry.", List.of(), "ollama", "llama3", 20, 0.001));

        VerifyResponse response = analysisService.verifyDocument(USER_ID,
                new VerifyRequest("sess1234sess1234", "other"));

        assertThat(response.documentType()).isEqualTo("other");
        assertThat(response.results().valid()).isNotEmpty();
        assertThat(response.summary().valid()).isEqualTo(response.results().valid().size());
    }
}
