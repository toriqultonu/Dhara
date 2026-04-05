package com.dhara.legal.judgment;

import com.dhara.common.ApiResponse;
import com.dhara.common.PagedResponse;
import com.dhara.legal.judgment.dto.JudgmentListResponse;
import com.dhara.legal.judgment.dto.JudgmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/judgments")
@RequiredArgsConstructor
public class JudgmentController {

    private final JudgmentService judgmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<JudgmentListResponse>>> listJudgments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(judgmentService.findAll(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JudgmentResponse>> getJudgment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(judgmentService.findById(id)));
    }
}
