package com.dhara.clause;

import com.dhara.clause.dto.ClauseResponse;
import com.dhara.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clauses")
@RequiredArgsConstructor
public class ClauseController {

    private final ClauseService clauseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClauseResponse>>> listClauses(
            @RequestParam(required = false) String category) {

        return ResponseEntity.ok(ApiResponse.ok(clauseService.findAll(category)));
    }
}
