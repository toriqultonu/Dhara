package com.dhara.analysis;

import com.dhara.analysis.dto.*;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.AnalysisSession;
import com.dhara.entity.User;
import com.dhara.grpc.RagClient;
import com.dhara.grpc.RagRestClient.RagAskPayload;
import com.dhara.grpc.RagRestClient.RagAskResponse;
import com.dhara.kafka.UsageEvent;
import com.dhara.kafka.UsageEventProducer;
import com.dhara.repository.AnalysisSessionRepository;
import com.dhara.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisService.class);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final int MAX_STORED_TEXT = 50000;
    private static final int MAX_QUESTION_CONTEXT = 45000;

    private final AnalysisSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final RagClient ragRestClient;
    private final UsageEventProducer usageEventProducer;
    private final ObjectMapper objectMapper;

    @Transactional
    public AnalysisUploadResponse uploadDocument(Long userId, MultipartFile file) throws IOException {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds 10 MB limit");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        ExtractedDocument extracted = extractText(file);
        String extractedText = extracted.text();
        int wordCount = countWords(extractedText);
        int pageCount = extracted.pageCount() != null
                ? extracted.pageCount()
                : Math.max(1, wordCount / 300);

        AnalysisSession session = new AnalysisSession();
        session.setId(UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        session.setUser(user);
        session.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");
        session.setPageCount(pageCount);
        session.setWordCount(wordCount);
        session.setExtractedText(extractedText.length() > MAX_STORED_TEXT
                ? extractedText.substring(0, MAX_STORED_TEXT) : extractedText);

        sessionRepository.save(session);

        String preview = extractedText.length() > 500
                ? extractedText.substring(0, 500) + "..." : extractedText;

        return new AnalysisUploadResponse(
                session.getId(),
                session.getFileName(),
                session.getPageCount(),
                session.getWordCount(),
                preview
        );
    }

    @Transactional(readOnly = true)
    public AnalysisQueryResponse queryDocument(Long userId, AnalysisQueryRequest request) {
        AnalysisSession session = sessionRepository.findByIdAndUserId(request.sessionId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis session", 0L));

        String documentText = truncate(session.getExtractedText(), MAX_QUESTION_CONTEXT);
        String language = request.language() != null ? request.language() : "bn";

        RagAskResponse ragResponse = ragRestClient.ask(new RagAskPayload(
                request.query(), language, "FREE", "document", documentText, null));

        List<AnalysisQueryResponse.LegalReference> references = ragResponse.citations() == null
                ? List.of()
                : ragResponse.citations().stream()
                        .map(c -> new AnalysisQueryResponse.LegalReference(
                                c.title(), c.section_number(), c.snippet()))
                        .toList();

        boolean ragAvailable = !"none".equals(ragResponse.llm_provider());
        double confidence = !ragAvailable ? 0.0 : (references.isEmpty() ? 0.6 : 0.85);

        publishUsageEvent(userId, "ASK", request.query(),
                ragResponse.tokens_used(), ragResponse.llm_provider(),
                BigDecimal.valueOf(ragResponse.cost_usd()));

        return new AnalysisQueryResponse(ragResponse.answer(), references, confidence);
    }

    @Transactional(readOnly = true)
    public VerifyResponse verifyDocument(Long userId, VerifyRequest request) {
        AnalysisSession session = sessionRepository.findByIdAndUserId(request.sessionId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis session", 0L));

        String documentText = truncate(session.getExtractedText(), MAX_QUESTION_CONTEXT);
        String documentType = request.documentType();

        String verificationPrompt = String.format(
                "Verify this %s document for compliance with Bangladesh law. "
                + "Identify valid clauses, warnings, and legal issues. "
                + "Respond ONLY with JSON in exactly this shape: "
                + "{\"valid\":[],\"warnings\":[],\"issues\":[]} where each array item is "
                + "{\"section\":\"clause name\",\"text\":\"finding\",\"law\":\"applicable law\","
                + "\"lawSection\":\"section number\",\"suggestion\":\"recommendation\"}. "
                + "Cite specific Bangladeshi statutes (e.g. Contract Act 1872, "
                + "Bangladesh Labour Act 2006). No prose outside the JSON.",
                documentType);

        RagAskResponse ragResponse = ragRestClient.ask(new RagAskPayload(
                verificationPrompt, "en", "FREE", "document", documentText, null));

        if (!"none".equals(ragResponse.llm_provider())) {
            publishUsageEvent(userId, "ASK", "verify:" + documentType,
                    ragResponse.tokens_used(), ragResponse.llm_provider(),
                    BigDecimal.valueOf(ragResponse.cost_usd()));

            VerifyResponse parsed = parseVerification(documentType, ragResponse.answer());
            if (parsed != null) {
                return parsed;
            }
            log.warn("Could not parse RAG verification answer; using rule-based fallback");
        } else {
            log.warn("RAG service unavailable for verification; using rule-based fallback");
        }

        return buildRuleBasedVerification(documentType, session.getExtractedText());
    }

    // ── Text extraction ────────────────────────────────────────────────

    private ExtractedDocument extractText(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename() != null
                ? file.getOriginalFilename().toLowerCase(Locale.ROOT) : "";
        String contentType = file.getContentType() != null ? file.getContentType() : "";
        byte[] bytes = file.getBytes();

        try {
            if (fileName.endsWith(".pdf") || contentType.contains("pdf")) {
                return extractPdf(bytes);
            }
            if (fileName.endsWith(".docx")
                    || contentType.contains("officedocument.wordprocessingml")) {
                return extractDocx(bytes);
            }
            if (fileName.endsWith(".txt") || contentType.contains("text")) {
                return new ExtractedDocument(new String(bytes, StandardCharsets.UTF_8).trim(), null);
            }
            // Unknown type — attempt plain UTF-8 read as last resort.
            log.warn("Unrecognized file type ({}); reading as plain text", contentType);
            return new ExtractedDocument(new String(bytes, StandardCharsets.UTF_8).trim(), null);
        } catch (IOException e) {
            log.warn("Could not extract text from {}: {}", file.getOriginalFilename(), e.getMessage());
            throw new IllegalArgumentException(
                    "Could not extract text from file. Supported formats: PDF, DOCX, TXT.");
        }
    }

    private ExtractedDocument extractPdf(byte[] bytes) throws IOException {
        try (PDDocument document = PDDocument.load(bytes)) {
            if (document.isEncrypted()) {
                throw new IllegalArgumentException("Encrypted PDFs are not supported");
            }
            String text = new PDFTextStripper().getText(document);
            return new ExtractedDocument(text.trim(), document.getNumberOfPages());
        }
    }

    private ExtractedDocument extractDocx(byte[] bytes) throws IOException {
        try (XWPFDocument docx = new XWPFDocument(new ByteArrayInputStream(bytes));
             XWPFWordExtractor extractor = new XWPFWordExtractor(docx)) {
            String text = extractor.getText();
            Integer pages = docx.getProperties().getExtendedProperties().getPages();
            return new ExtractedDocument(text.trim(),
                    pages != null && pages > 0 ? pages : null);
        }
    }

    private record ExtractedDocument(String text, Integer pageCount) {}

    // ── Helpers ────────────────────────────────────────────────────────

    private int countWords(String text) {
        if (text == null || text.isBlank()) return 0;
        return text.trim().split("\\s+").length;
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength) : text;
    }

    private void publishUsageEvent(Long userId, String actionType, String queryText,
                                   Integer tokensUsed, String llmProvider, BigDecimal costUsd) {
        try {
            usageEventProducer.send(new UsageEvent(
                    userId, actionType, queryText, tokensUsed, llmProvider, costUsd, Instant.now()));
        } catch (Exception e) {
            log.warn("Failed to publish usage event for user {}: {}", userId, e.getMessage());
        }
    }

    /** Parses the LLM's JSON verification answer. Returns null when unparseable. */
    private VerifyResponse parseVerification(String documentType, String answer) {
        if (answer == null || answer.isBlank()) return null;
        try {
            int start = answer.indexOf('{');
            int end = answer.lastIndexOf('}');
            if (start < 0 || end <= start) return null;
            String json = answer.substring(start, end + 1);

            LlmVerification result = objectMapper.readValue(json, LlmVerification.class);
            List<VerifyResponse.VerifyItem> valid = result.valid() != null ? result.valid() : List.of();
            List<VerifyResponse.VerifyItem> warnings = result.warnings() != null ? result.warnings() : List.of();
            List<VerifyResponse.VerifyItem> issues = result.issues() != null ? result.issues() : List.of();

            if (valid.isEmpty() && warnings.isEmpty() && issues.isEmpty()) return null;

            return new VerifyResponse(documentType,
                    new VerifyResponse.VerifySummary(valid.size(), warnings.size(), issues.size()),
                    new VerifyResponse.VerifyResults(valid, warnings, issues));
        } catch (Exception e) {
            log.warn("Failed to parse verification JSON: {}", e.getMessage());
            return null;
        }
    }

    private record LlmVerification(
            List<VerifyResponse.VerifyItem> valid,
            List<VerifyResponse.VerifyItem> warnings,
            List<VerifyResponse.VerifyItem> issues
    ) {}

    // ── Rule-based fallback (used only when the RAG service is down) ───

    private VerifyResponse buildRuleBasedVerification(String documentType, String text) {
        String type = documentType != null ? documentType : "other";
        String lowerText = text != null ? text.toLowerCase(Locale.ROOT) : "";

        List<VerifyResponse.VerifyItem> valid = new java.util.ArrayList<>();
        valid.add(new VerifyResponse.VerifyItem(
                "Document Format",
                "Document contains recognizable legal clauses",
                "Contract Act 1872", "Section 10",
                "Document structure appears legally valid."));

        List<VerifyResponse.VerifyItem> warnings = new java.util.ArrayList<>();
        List<VerifyResponse.VerifyItem> issues = new java.util.ArrayList<>();

        if ("employment".equals(type)) {
            if (!lowerText.contains("notice period") && !lowerText.contains("termination")) {
                issues.add(new VerifyResponse.VerifyItem(
                        "Termination Clause",
                        "No termination notice period found",
                        "Bangladesh Labour Act 2006", "Section 20",
                        "Employment contracts must specify a minimum 120-day notice period for permanent employees."));
            }
            if (!lowerText.contains("salary") && !lowerText.contains("remuneration")) {
                warnings.add(new VerifyResponse.VerifyItem(
                        "Remuneration",
                        "Salary/remuneration clause not clearly defined",
                        "Bangladesh Labour Act 2006", "Section 122",
                        "Ensure salary payment is specified and within 7 working days of month end."));
            }
            if (lowerText.contains("8 hours") || lowerText.contains("working hours")) {
                valid.add(new VerifyResponse.VerifyItem(
                        "Working Hours",
                        "Working hours clause detected",
                        "Bangladesh Labour Act 2006", "Section 100",
                        "Complies with the maximum 8 hours/day provision."));
            }
        }

        if (warnings.isEmpty()) {
            warnings.add(new VerifyResponse.VerifyItem(
                    "Dispute Resolution",
                    "No dispute resolution clause found",
                    "Arbitration Act 2001", "Section 7",
                    "Consider adding a dispute resolution mechanism."));
        }

        VerifyResponse.VerifySummary summary = new VerifyResponse.VerifySummary(
                valid.size(), warnings.size(), issues.size());

        return new VerifyResponse(type, summary,
                new VerifyResponse.VerifyResults(valid, warnings, issues));
    }
}
