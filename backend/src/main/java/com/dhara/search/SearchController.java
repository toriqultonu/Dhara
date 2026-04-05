package com.dhara.search;

import com.dhara.common.ApiResponse;
import com.dhara.common.Constants;
import com.dhara.search.dto.AskRequest;
import com.dhara.search.dto.SearchRequest;
import com.dhara.search.dto.SearchResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<SearchResponse>> search(
            @Valid @RequestBody SearchRequest request, Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        String tier = Constants.TIER_FREE; // TODO: resolve from subscription
        return ResponseEntity.ok(ApiResponse.ok(searchService.search(request, userId, tier)));
    }

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<SearchResponse>> ask(
            @Valid @RequestBody AskRequest request, Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        String tier = Constants.TIER_FREE; // TODO: resolve from subscription
        return ResponseEntity.ok(ApiResponse.ok(searchService.ask(request, userId, tier)));
    }
}
