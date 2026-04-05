package com.dhara.legal.statute;

import com.dhara.common.ApiResponse;
import com.dhara.legal.statute.dto.SectionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/statutes/{statuteId}/sections")
@RequiredArgsConstructor
public class SectionController {

    private final StatuteService statuteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SectionResponse>>> getSections(@PathVariable Long statuteId) {
        return ResponseEntity.ok(ApiResponse.ok(statuteService.findSections(statuteId)));
    }
}
