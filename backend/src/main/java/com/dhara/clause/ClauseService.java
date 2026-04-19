package com.dhara.clause;

import com.dhara.clause.dto.ClauseResponse;
import com.dhara.repository.LegalClauseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClauseService {

    private final LegalClauseRepository clauseRepository;

    @Transactional(readOnly = true)
    public List<ClauseResponse> findAll(String category) {
        if (category != null && !category.isBlank()) {
            return clauseRepository.findByStatusAndCategoryOrderByTitleAsc("ACTIVE", category)
                    .stream().map(ClauseResponse::from).toList();
        }
        return clauseRepository.findByStatusOrderByTitleAsc("ACTIVE")
                .stream().map(ClauseResponse::from).toList();
    }
}
