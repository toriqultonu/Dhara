package com.dhara.legal.sro;

import com.dhara.common.ApiResponse;
import com.dhara.common.PagedResponse;
import com.dhara.legal.sro.dto.SroResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sros")
@RequiredArgsConstructor
public class SroController {

    private final SroService sroService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SroResponse>>> listSros(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(sroService.findAll(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SroResponse>> getSro(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(sroService.findById(id)));
    }
}
