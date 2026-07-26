package com.dhara.template;

import com.dhara.common.PagedResponse;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.DocumentTemplate;
import com.dhara.repository.DocumentTemplateRepository;
import com.dhara.template.dto.TemplateListResponse;
import com.dhara.template.dto.TemplateResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TemplateServiceTest {

    @Mock
    private DocumentTemplateRepository templateRepository;

    @InjectMocks
    private TemplateService templateService;

    private DocumentTemplate template(Long id, String title) {
        DocumentTemplate t = new DocumentTemplate();
        t.setId(id);
        t.setTitle(title);
        t.setCategory("contract");
        t.setContent("<p>body</p>");
        t.setPopularity(10);
        return t;
    }

    @Test
    void findAll_withFilters_returnsPagedResponse() {
        when(templateRepository.findWithFilters(eq("contract"), eq("rent"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(template(1L, "Rent Agreement")),
                        PageRequest.of(0, 20), 1));

        PagedResponse<TemplateListResponse> response =
                templateService.findAll("contract", "rent", 0, 20);

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).title()).isEqualTo("Rent Agreement");
        assertThat(response.total()).isEqualTo(1);
    }

    @Test
    void findById_existingTemplate_returnsResponseWithContent() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template(1L, "Rent Agreement")));

        TemplateResponse response = templateService.findById(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.content()).isEqualTo("<p>body</p>");
    }

    @Test
    void findById_missingTemplate_throwsResourceNotFound() {
        when(templateRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> templateService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Template");
    }
}
