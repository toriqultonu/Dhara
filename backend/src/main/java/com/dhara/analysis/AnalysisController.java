package com.dhara.analysis;

import com.dhara.analysis.dto.*;
import com.dhara.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AnalysisUploadResponse>> uploadDocument(
            Authentication auth,
            @RequestPart("file") MultipartFile file) throws IOException {

        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(analysisService.uploadDocument(userId, file)));
    }

    @PostMapping("/query")
    public ResponseEntity<ApiResponse<AnalysisQueryResponse>> queryDocument(
            Authentication auth,
            @RequestBody AnalysisQueryRequest request) {

        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(analysisService.queryDocument(userId, request)));
    }

    @PostMapping(value = "/verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<VerifyResponse>> verifyDocument(
            Authentication auth,
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false, defaultValue = "other") String documentType) throws IOException {

        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(
                analysisService.verifyDocument(userId, file, documentType)));
    }
}
