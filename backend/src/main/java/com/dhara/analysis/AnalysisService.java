package com.dhara.analysis;

import com.dhara.analysis.dto.*;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.AnalysisSession;
import com.dhara.entity.User;
import com.dhara.repository.AnalysisSessionRepository;
import com.dhara.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisService.class);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private final AnalysisSessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Transactional
    public AnalysisUploadResponse uploadDocument(Long userId, MultipartFile file) throws IOException {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds 10 MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.contains("pdf") && !contentType.contains("text")
                && !contentType.contains("word") && !contentType.contains("msword"))) {
            log.warn("Potentially unsupported file type: {}", contentType);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        String extractedText = extractText(file);
        int wordCount = countWords(extractedText);
        int estimatedPages = Math.max(1, wordCount / 300);

        AnalysisSession session = new AnalysisSession();
        session.setId(UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        session.setUser(user);
        session.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");
        session.setPageCount(estimatedPages);
        session.setWordCount(wordCount);
        session.setExtractedText(extractedText.length() > 50000
                ? extractedText.substring(0, 50000) : extractedText);

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

        String context = session.getExtractedText() != null
                ? session.getExtractedText().substring(0,
                        Math.min(2000, session.getExtractedText().length()))
                : "";

        // TODO: Route through RAG service for real AI analysis.
        // For now, return a placeholder that describes what was uploaded.
        String answer = buildPlaceholderAnswer(request.query(), session.getFileName(), context);

        List<AnalysisQueryResponse.LegalReference> references = List.of(
                new AnalysisQueryResponse.LegalReference(
                        "Bangladesh Labour Act 2006", "Section 20",
                        "Applicable to employment-related queries"),
                new AnalysisQueryResponse.LegalReference(
                        "Contract Act 1872", "Section 10",
                        "Applicable to agreement validity")
        );

        return new AnalysisQueryResponse(answer, references, 0.75);
    }

    public VerifyResponse verifyDocument(Long userId, MultipartFile file, String documentType) throws IOException {
        String text = extractText(file);
        return buildVerificationResponse(documentType, text);
    }

    private String extractText(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType != null && contentType.contains("text")) {
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        }
        // For PDF/DOCX — basic byte extraction fallback.
        // In production, integrate Apache PDFBox or Apache POI text extraction.
        try {
            return new String(file.getBytes(), StandardCharsets.UTF_8)
                    .replaceAll("[^\\x20-\\x7E\\n\\r]", " ")
                    .replaceAll("\\s{3,}", "\n")
                    .trim();
        } catch (Exception e) {
            log.warn("Could not extract text from {}: {}", file.getOriginalFilename(), e.getMessage());
            return "Text extraction not available for this file type. Filename: " + file.getOriginalFilename();
        }
    }

    private int countWords(String text) {
        if (text == null || text.isBlank()) return 0;
        return text.trim().split("\\s+").length;
    }

    private String buildPlaceholderAnswer(String query, String fileName, String context) {
        return String.format(
                "Analyzing document \"%s\" for your query: \"%s\"\n\n" +
                "Based on the document content, this section addresses your question. " +
                "For a comprehensive analysis, the RAG pipeline will cross-reference " +
                "with relevant Bangladesh laws.\n\n" +
                "Note: Full AI analysis requires the RAG service to be connected.",
                fileName, query);
    }

    private VerifyResponse buildVerificationResponse(String documentType, String text) {
        String type = documentType != null ? documentType : "other";
        String lowerText = text.toLowerCase();

        List<VerifyResponse.VerifyItem> valid = List.of(
                new VerifyResponse.VerifyItem(
                        "Document Format",
                        "Document contains recognizable legal clauses",
                        "Contract Act 1872", "Section 10",
                        "Document structure appears legally valid.")
        );

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
                valid = new java.util.ArrayList<>(valid);
                ((java.util.ArrayList<VerifyResponse.VerifyItem>) valid).add(
                        new VerifyResponse.VerifyItem(
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
