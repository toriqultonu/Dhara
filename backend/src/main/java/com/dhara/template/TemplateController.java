package com.dhara.template;

import com.dhara.common.ApiResponse;
import com.dhara.common.PagedResponse;
import com.dhara.template.dto.TemplateListResponse;
import com.dhara.template.dto.TemplateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TemplateListResponse>>> listTemplates(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(
                templateService.findAll(category, search, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TemplateResponse>> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(templateService.findById(id)));
    }
}
