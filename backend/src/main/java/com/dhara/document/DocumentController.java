package com.dhara.document;

import com.dhara.common.ApiResponse;
import com.dhara.common.PagedResponse;
import com.dhara.document.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<DocumentListResponse>>> listDocuments(
            Authentication auth,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(
                documentService.listDocuments(userId, status, category, search, page, size)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DocumentStatsResponse>> getStats(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(documentService.getStats(userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DocumentResponse>> createDocument(
            Authentication auth, @Valid @RequestBody DocumentRequest request) {

        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.status(201)
                .body(ApiResponse.ok(documentService.createDocument(userId, request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocument(
            Authentication auth, @PathVariable Long id) {

        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(documentService.getDocument(userId, id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> updateDocument(
            Authentication auth, @PathVariable Long id, @RequestBody DocumentRequest request) {

        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(documentService.updateDocument(userId, id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteDocument(
            Authentication auth, @PathVariable Long id) {

        Long userId = Long.parseLong(auth.getName());
        documentService.deleteDocument(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Document deleted"));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ApiResponse<DocumentResponse>> duplicateDocument(
            Authentication auth, @PathVariable Long id) {

        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.status(201)
                .body(ApiResponse.ok(documentService.duplicateDocument(userId, id)));
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<ApiResponse<ShareDocumentResponse>> shareDocument(
            Authentication auth, @PathVariable Long id,
            @RequestBody ShareDocumentRequest request) {

        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(documentService.shareDocument(userId, id, request)));
    }

    @PostMapping("/{id}/export")
    public ResponseEntity<byte[]> exportDocument(
            Authentication auth, @PathVariable Long id,
            @RequestBody ExportRequest request) throws IOException {

        Long userId = Long.parseLong(auth.getName());
        String format = request.format() != null ? request.format().toLowerCase() : "txt";
        byte[] data = documentService.exportDocument(userId, id, format);

        MediaType mediaType = switch (format) {
            case "pdf" -> MediaType.APPLICATION_PDF;
            case "docx" -> MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            default -> MediaType.TEXT_PLAIN;
        };

        String ext = switch (format) {
            case "pdf" -> ".pdf";
            case "docx" -> ".docx";
            default -> ".txt";
        };

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentDisposition(
                ContentDisposition.attachment().filename("document" + ext).build());

        return ResponseEntity.ok().headers(headers).body(data);
    }
}
