package com.dhara.template;

import com.dhara.common.PagedResponse;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.DocumentTemplate;
import com.dhara.repository.DocumentTemplateRepository;
import com.dhara.template.dto.TemplateListResponse;
import com.dhara.template.dto.TemplateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final DocumentTemplateRepository templateRepository;

    @Transactional(readOnly = true)
    public PagedResponse<TemplateListResponse> findAll(String category, String search, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<DocumentTemplate> result = templateRepository.findWithFilters(category, search, pageable);
        return new PagedResponse<>(
                result.getContent().stream().map(TemplateListResponse::from).toList(),
                result.getTotalElements(), page, size);
    }

    @Transactional(readOnly = true)
    public TemplateResponse findById(Long id) {
        return TemplateResponse.from(
                templateRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Template", id)));
    }
}
