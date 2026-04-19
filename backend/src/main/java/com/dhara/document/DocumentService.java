package com.dhara.document;

import com.dhara.common.PagedResponse;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.document.dto.*;
import com.dhara.entity.DocumentTemplate;
import com.dhara.entity.User;
import com.dhara.entity.UserDocument;
import com.dhara.repository.DocumentTemplateRepository;
import com.dhara.repository.UserDocumentRepository;
import com.dhara.repository.UserRepository;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final UserDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentTemplateRepository templateRepository;

    private static final Pattern HTML_TAGS = Pattern.compile("<[^>]+>");

    @Transactional(readOnly = true)
    public PagedResponse<DocumentListResponse> listDocuments(
            Long userId, String status, String category, String search, int page, int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<UserDocument> result = documentRepository.findByUserIdWithFilters(
                userId, status, category, search, pageable);

        List<DocumentListResponse> items = result.getContent().stream()
                .map(DocumentListResponse::from).toList();
        return new PagedResponse<>(items, result.getTotalElements(), page, size);
    }

    @Transactional(readOnly = true)
    public DocumentStatsResponse getStats(Long userId) {
        long total = documentRepository.countByUserId(userId);
        long drafts = documentRepository.countByUserIdAndStatus(userId, "draft");
        long completed = documentRepository.countByUserIdAndStatus(userId, "completed");
        long shared = documentRepository.countByUserIdAndShared(userId, true);
        return new DocumentStatsResponse(total, drafts, completed, shared);
    }

    @Transactional
    public DocumentResponse createDocument(Long userId, DocumentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        UserDocument doc = new UserDocument();
        doc.setUser(user);
        doc.setTitle(request.title());
        doc.setCategory(request.category() != null ? request.category() : "other");
        doc.setStatus("draft");
        doc.setContent(request.content());
        doc.setTags(request.tags());

        if (request.templateId() != null) {
            DocumentTemplate template = templateRepository.findById(request.templateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Template", request.templateId()));
            doc.setTemplate(template);
            if (doc.getContent() == null || doc.getContent().isBlank()) {
                doc.setContent(template.getContent());
            }
        }

        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocument(Long userId, Long docId) {
        UserDocument doc = findOwnedDocument(userId, docId);
        return DocumentResponse.from(doc);
    }

    @Transactional
    public DocumentResponse updateDocument(Long userId, Long docId, DocumentRequest request) {
        UserDocument doc = findOwnedDocument(userId, docId);

        if (request.title() != null) doc.setTitle(request.title());
        if (request.content() != null) doc.setContent(request.content());
        if (request.status() != null) doc.setStatus(request.status());
        if (request.category() != null) doc.setCategory(request.category());
        if (request.tags() != null) doc.setTags(request.tags());

        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Transactional
    public void deleteDocument(Long userId, Long docId) {
        UserDocument doc = findOwnedDocument(userId, docId);
        documentRepository.delete(doc);
    }

    @Transactional
    public DocumentResponse duplicateDocument(Long userId, Long docId) {
        UserDocument original = findOwnedDocument(userId, docId);
        User user = original.getUser();

        UserDocument copy = new UserDocument();
        copy.setUser(user);
        copy.setTitle("Copy of " + original.getTitle());
        copy.setCategory(original.getCategory());
        copy.setStatus("draft");
        copy.setContent(original.getContent());
        copy.setTags(original.getTags());
        copy.setTemplate(original.getTemplate());

        return DocumentResponse.from(documentRepository.save(copy));
    }

    @Transactional
    public ShareDocumentResponse shareDocument(Long userId, Long docId, ShareDocumentRequest request) {
        UserDocument doc = findOwnedDocument(userId, docId);

        String shareToken = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String shareUrl = "https://dhara.app/shared/" + shareToken;
        Instant expiresAt = Instant.now().plusSeconds(30L * 24 * 3600);

        doc.setShared(true);
        doc.setShareUrl(shareUrl);
        doc.setSharePermission(request.permission() != null ? request.permission() : "view");
        doc.setShareExpiresAt(expiresAt);
        doc.setStatus("shared");

        documentRepository.save(doc);
        return new ShareDocumentResponse(shareUrl, expiresAt);
    }

    @Transactional(readOnly = true)
    public byte[] exportDocument(Long userId, Long docId, String format) throws IOException {
        UserDocument doc = findOwnedDocument(userId, docId);
        String content = doc.getContent() != null ? doc.getContent() : "<p>" + doc.getTitle() + "</p>";

        return switch (format.toLowerCase()) {
            case "pdf" -> exportPdf(doc.getTitle(), content);
            case "docx" -> exportDocx(doc.getTitle(), content);
            case "txt" -> exportTxt(content);
            default -> throw new IllegalArgumentException("Unsupported format: " + format);
        };
    }

    private byte[] exportPdf(String title, String html) throws IOException {
        String wrappedHtml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" " +
                "\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">" +
                "<html xmlns=\"http://www.w3.org/1999/xhtml\"><head>" +
                "<meta charset=\"UTF-8\"/>" +
                "<style>body{font-family:serif;margin:40px;line-height:1.6;}h1,h2,h3{color:#1a1a2e;}" +
                "p{margin-bottom:12px;}</style>" +
                "<title>" + title + "</title></head><body>" + html + "</body></html>";

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfRendererBuilder renderer = new PdfRendererBuilder();
        renderer.useFastMode();
        renderer.withHtmlContent(wrappedHtml, null);
        renderer.toStream(out);
        renderer.run();
        return out.toByteArray();
    }

    private byte[] exportDocx(String title, String htmlContent) throws IOException {
        String plainText = HTML_TAGS.matcher(htmlContent).replaceAll("");
        String[] lines = plainText.split("\n");

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (XWPFDocument docx = new XWPFDocument()) {
            XWPFParagraph titlePara = docx.createParagraph();
            XWPFRun titleRun = titlePara.createRun();
            titleRun.setText(title);
            titleRun.setBold(true);
            titleRun.setFontSize(16);

            for (String line : lines) {
                String trimmed = line.trim();
                if (!trimmed.isEmpty()) {
                    XWPFParagraph para = docx.createParagraph();
                    XWPFRun run = para.createRun();
                    run.setText(trimmed);
                    run.setFontSize(11);
                }
            }

            docx.write(out);
        }
        return out.toByteArray();
    }

    private byte[] exportTxt(String html) {
        String text = HTML_TAGS.matcher(html).replaceAll("")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&quot;", "\"")
                .replaceAll("\\s{3,}", "\n\n")
                .trim();
        return text.getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private UserDocument findOwnedDocument(Long userId, Long docId) {
        UserDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", docId));
        if (!doc.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Document", docId);
        }
        return doc;
    }
}
