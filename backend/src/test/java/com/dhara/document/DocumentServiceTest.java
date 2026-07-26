package com.dhara.document;

import com.dhara.common.ResourceNotFoundException;
import com.dhara.document.dto.CreateDocumentRequest;
import com.dhara.document.dto.DocumentResponse;
import com.dhara.document.dto.ShareDocumentRequest;
import com.dhara.document.dto.ShareDocumentResponse;
import com.dhara.document.dto.UpdateDocumentRequest;
import com.dhara.entity.DocumentTemplate;
import com.dhara.entity.User;
import com.dhara.entity.UserDocument;
import com.dhara.repository.DocumentTemplateRepository;
import com.dhara.repository.UserDocumentRepository;
import com.dhara.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    private static final Long OWNER_ID = 42L;
    private static final Long OTHER_USER_ID = 99L;

    @Mock
    private UserDocumentRepository documentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DocumentTemplateRepository templateRepository;

    @InjectMocks
    private DocumentService documentService;

    private User owner() {
        User u = new User();
        u.setId(OWNER_ID);
        u.setName("Rahim Uddin");
        return u;
    }

    private UserDocument ownedDocument(Long docId) {
        UserDocument doc = new UserDocument();
        doc.setId(docId);
        doc.setUser(owner());
        doc.setTitle("Rent Agreement");
        doc.setCategory("contract");
        doc.setStatus("draft");
        doc.setContent("<p>Hello &amp; welcome</p>");
        doc.setTags(new String[]{"rent"});
        return doc;
    }

    private void stubSaveReturnsArgument() {
        when(documentRepository.save(any(UserDocument.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    // ── create ─────────────────────────────────────────────────────────

    @Test
    void createDocument_basicRequest_savesDraftForUser() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner()));
        stubSaveReturnsArgument();

        CreateDocumentRequest request = new CreateDocumentRequest(
                "My Petition", "petition", null, "<p>text</p>", new String[]{"court"});
        DocumentResponse response = documentService.createDocument(OWNER_ID, request);

        assertThat(response.title()).isEqualTo("My Petition");
        assertThat(response.category()).isEqualTo("petition");
        assertThat(response.status()).isEqualTo("draft");
        assertThat(response.content()).isEqualTo("<p>text</p>");
    }

    @Test
    void createDocument_withTemplateAndNoContent_copiesTemplateContent() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner()));
        DocumentTemplate template = new DocumentTemplate();
        template.setId(5L);
        template.setContent("<p>template body</p>");
        when(templateRepository.findById(5L)).thenReturn(Optional.of(template));
        stubSaveReturnsArgument();

        CreateDocumentRequest request = new CreateDocumentRequest(
                "From Template", null, 5L, null, null);
        DocumentResponse response = documentService.createDocument(OWNER_ID, request);

        assertThat(response.content()).isEqualTo("<p>template body</p>");
        assertThat(response.templateId()).isEqualTo(5L);
        assertThat(response.category()).isEqualTo("other");
    }

    @Test
    void createDocument_missingTemplate_throwsResourceNotFound() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner()));
        when(templateRepository.findById(77L)).thenReturn(Optional.empty());

        CreateDocumentRequest request = new CreateDocumentRequest("X", null, 77L, null, null);
        assertThatThrownBy(() -> documentService.createDocument(OWNER_ID, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Template");
    }

    @Test
    void createDocument_missingUser_throwsResourceNotFound() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.empty());

        CreateDocumentRequest request = new CreateDocumentRequest("X", null, null, null, null);
        assertThatThrownBy(() -> documentService.createDocument(OWNER_ID, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── read / ownership ───────────────────────────────────────────────

    @Test
    void getDocument_ownedDocument_returnsResponse() {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(ownedDocument(1L)));

        DocumentResponse response = documentService.getDocument(OWNER_ID, 1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo("Rent Agreement");
    }

    @Test
    void getDocument_notOwner_throwsResourceNotFound() {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(ownedDocument(1L)));

        assertThatThrownBy(() -> documentService.getDocument(OTHER_USER_ID, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getDocument_missingDocument_throwsResourceNotFound() {
        when(documentRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.getDocument(OWNER_ID, 404L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── update ─────────────────────────────────────────────────────────

    @Test
    void updateDocument_partialFields_updatesOnlyProvidedOnes() {
        UserDocument doc = ownedDocument(1L);
        when(documentRepository.findById(1L)).thenReturn(Optional.of(doc));
        stubSaveReturnsArgument();

        UpdateDocumentRequest request = new UpdateDocumentRequest(
                "New Title", null, null, "completed", null);
        DocumentResponse response = documentService.updateDocument(OWNER_ID, 1L, request);

        assertThat(response.title()).isEqualTo("New Title");
        assertThat(response.status()).isEqualTo("completed");
        assertThat(response.category()).isEqualTo("contract");
        assertThat(response.content()).isEqualTo("<p>Hello &amp; welcome</p>");
    }

    @Test
    void updateDocument_notOwner_throwsResourceNotFound() {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(ownedDocument(1L)));

        UpdateDocumentRequest request = new UpdateDocumentRequest("X", null, null, null, null);
        assertThatThrownBy(() -> documentService.updateDocument(OTHER_USER_ID, 1L, request))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(documentRepository, never()).save(any());
    }

    // ── delete ─────────────────────────────────────────────────────────

    @Test
    void deleteDocument_ownedDocument_deletes() {
        UserDocument doc = ownedDocument(1L);
        when(documentRepository.findById(1L)).thenReturn(Optional.of(doc));

        documentService.deleteDocument(OWNER_ID, 1L);

        verify(documentRepository).delete(doc);
    }

    @Test
    void deleteDocument_notOwner_throwsAndDoesNotDelete() {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(ownedDocument(1L)));

        assertThatThrownBy(() -> documentService.deleteDocument(OTHER_USER_ID, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(documentRepository, never()).delete(any(UserDocument.class));
    }

    // ── duplicate ──────────────────────────────────────────────────────

    @Test
    void duplicateDocument_ownedDocument_copiesContentAsNewDraft() {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(ownedDocument(1L)));
        stubSaveReturnsArgument();

        DocumentResponse copy = documentService.duplicateDocument(OWNER_ID, 1L);

        assertThat(copy.title()).isEqualTo("Copy of Rent Agreement");
        assertThat(copy.status()).isEqualTo("draft");
        assertThat(copy.content()).isEqualTo("<p>Hello &amp; welcome</p>");
        assertThat(copy.category()).isEqualTo("contract");

        ArgumentCaptor<UserDocument> captor = ArgumentCaptor.forClass(UserDocument.class);
        verify(documentRepository).save(captor.capture());
        assertThat(captor.getValue().getId()).isNull();
    }

    // ── share ──────────────────────────────────────────────────────────

    @Test
    void shareDocument_ownedDocument_generatesShareUrlAndMarksShared() {
        UserDocument doc = ownedDocument(1L);
        when(documentRepository.findById(1L)).thenReturn(Optional.of(doc));

        ShareDocumentResponse response = documentService.shareDocument(
                OWNER_ID, 1L, new ShareDocumentRequest(null, null));

        assertThat(response.shareUrl()).startsWith("https://dhara.app/shared/");
        assertThat(response.expiresAt()).isNotNull();
        assertThat(doc.getShared()).isTrue();
        assertThat(doc.getStatus()).isEqualTo("shared");
        assertThat(doc.getSharePermission()).isEqualTo("view");
        verify(documentRepository).save(doc);
    }

    @Test
    void shareDocument_explicitPermission_isKept() {
        UserDocument doc = ownedDocument(1L);
        when(documentRepository.findById(1L)).thenReturn(Optional.of(doc));

        documentService.shareDocument(OWNER_ID, 1L, new ShareDocumentRequest("edit", null));

        assertThat(doc.getSharePermission()).isEqualTo("edit");
    }

    // ── export ─────────────────────────────────────────────────────────

    @Test
    void exportDocument_txtFormat_stripsHtmlAndDecodesEntities() throws IOException {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(ownedDocument(1L)));

        byte[] data = documentService.exportDocument(OWNER_ID, 1L, "txt");

        assertThat(new String(data, StandardCharsets.UTF_8)).isEqualTo("Hello & welcome");
    }

    @Test
    void exportDocument_pdfFormat_returnsNonEmptyPdfBytes() throws IOException {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(ownedDocument(1L)));

        byte[] data = documentService.exportDocument(OWNER_ID, 1L, "pdf");

        assertThat(data).isNotEmpty();
        assertThat(new String(data, 0, 4, StandardCharsets.US_ASCII)).isEqualTo("%PDF");
    }

    @Test
    void exportDocument_docxFormat_returnsNonEmptyZipBytes() throws IOException {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(ownedDocument(1L)));

        byte[] data = documentService.exportDocument(OWNER_ID, 1L, "docx");

        assertThat(data).isNotEmpty();
        // DOCX is a ZIP container: PK magic bytes
        assertThat(data[0]).isEqualTo((byte) 'P');
        assertThat(data[1]).isEqualTo((byte) 'K');
    }

    @Test
    void exportDocument_unsupportedFormat_throwsIllegalArgument() {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(ownedDocument(1L)));

        assertThatThrownBy(() -> documentService.exportDocument(OWNER_ID, 1L, "odt"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported format");
    }
}
