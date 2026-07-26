package com.dhara.document;

import com.dhara.auth.JwtService;
import com.dhara.common.PagedResponse;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.document.dto.CreateDocumentRequest;
import com.dhara.document.dto.DocumentListResponse;
import com.dhara.document.dto.DocumentResponse;
import com.dhara.document.dto.ShareDocumentRequest;
import com.dhara.document.dto.ShareDocumentResponse;
import com.dhara.document.dto.UpdateDocumentRequest;
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

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DocumentController.class)
@AutoConfigureMockMvc(addFilters = false)
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DocumentService documentService;

    @MockitoBean
    private JwtService jwtService; // required by the component-scanned JwtAuthFilter

    private Authentication userAuth() {
        return new UsernamePasswordAuthenticationToken(
                "42", null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    private DocumentResponse documentResponse(Long id, String title) {
        return new DocumentResponse(id, title, "contract", "draft", "<p>text</p>",
                new String[]{"rent"}, false, null, null, Instant.now(), Instant.now());
    }

    @Test
    void listDocuments_parsesUserIdFromPrincipal() throws Exception {
        DocumentListResponse item = new DocumentListResponse(
                1L, "Rent Agreement", "contract", "draft", null, false, Instant.now(), Instant.now());
        when(documentService.listDocuments(eq(42L), isNull(), isNull(), isNull(), eq(0), eq(20)))
                .thenReturn(new PagedResponse<>(List.of(item), 1, 0, 20));

        mockMvc.perform(get("/api/documents").principal(userAuth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].title").value("Rent Agreement"))
                .andExpect(jsonPath("$.data.total").value(1));

        verify(documentService).listDocuments(eq(42L), isNull(), isNull(), isNull(), eq(0), eq(20));
    }

    @Test
    void createDocument_validRequest_returns201() throws Exception {
        when(documentService.createDocument(eq(42L), any(CreateDocumentRequest.class)))
                .thenReturn(documentResponse(10L, "New Doc"));

        mockMvc.perform(post("/api/documents")
                        .principal(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"New Doc\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.title").value("New Doc"));
    }

    @Test
    void createDocument_missingTitle_returns400() throws Exception {
        mockMvc.perform(post("/api/documents")
                        .principal(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"category\":\"contract\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void getDocument_existingId_returnsDocument() throws Exception {
        when(documentService.getDocument(42L, 1L)).thenReturn(documentResponse(1L, "Rent Agreement"));

        mockMvc.perform(get("/api/documents/1").principal(userAuth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.title").value("Rent Agreement"));
    }

    @Test
    void getDocument_notOwned_returns404() throws Exception {
        when(documentService.getDocument(42L, 7L))
                .thenThrow(new ResourceNotFoundException("Document", 7L));

        mockMvc.perform(get("/api/documents/7").principal(userAuth()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void updateDocument_validRequest_returnsUpdatedDocument() throws Exception {
        when(documentService.updateDocument(eq(42L), eq(1L), any(UpdateDocumentRequest.class)))
                .thenReturn(documentResponse(1L, "Updated Title"));

        mockMvc.perform(put("/api/documents/1")
                        .principal(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Updated Title\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Updated Title"));
    }

    @Test
    void deleteDocument_existingId_returnsConfirmation() throws Exception {
        mockMvc.perform(delete("/api/documents/1").principal(userAuth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("Document deleted"));

        verify(documentService).deleteDocument(42L, 1L);
    }

    @Test
    void duplicateDocument_existingId_returns201() throws Exception {
        when(documentService.duplicateDocument(42L, 1L))
                .thenReturn(documentResponse(2L, "Copy of Rent Agreement"));

        mockMvc.perform(post("/api/documents/1/duplicate").principal(userAuth()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Copy of Rent Agreement"));
    }

    @Test
    void shareDocument_existingId_returnsShareUrl() throws Exception {
        when(documentService.shareDocument(eq(42L), eq(1L), any(ShareDocumentRequest.class)))
                .thenReturn(new ShareDocumentResponse("https://dhara.app/shared/abc123", Instant.now()));

        mockMvc.perform(post("/api/documents/1/share")
                        .principal(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"permission\":\"view\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.shareUrl").value("https://dhara.app/shared/abc123"));
    }

    @Test
    void exportDocument_txtFormat_returnsAttachmentBytes() throws Exception {
        when(documentService.exportDocument(42L, 1L, "txt"))
                .thenReturn("Hello & welcome".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(post("/api/documents/1/export")
                        .principal(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"txt\"}"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                .andExpect(header().string("Content-Disposition",
                        "attachment; filename=\"document.txt\""))
                .andExpect(content().bytes("Hello & welcome".getBytes(StandardCharsets.UTF_8)));
    }
}
