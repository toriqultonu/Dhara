package com.dhara.legal.statute;

import com.dhara.common.ApiResponse;
import com.dhara.common.PagedResponse;
import com.dhara.legal.statute.dto.StatuteListResponse;
import com.dhara.legal.statute.dto.StatuteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statutes")
@RequiredArgsConstructor
public class StatuteController {

    private final StatuteService statuteService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<StatuteListResponse>>> listStatutes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(statuteService.findAll(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StatuteResponse>> getStatute(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(statuteService.findById(id)));
    }
}
