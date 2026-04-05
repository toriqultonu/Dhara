package com.dhara.legal.judgment;

import com.dhara.common.PagedResponse;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.Judgment;
import com.dhara.legal.judgment.dto.JudgmentListResponse;
import com.dhara.legal.judgment.dto.JudgmentResponse;
import com.dhara.repository.JudgmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JudgmentService {

    private final JudgmentRepository judgmentRepository;

    @Transactional(readOnly = true)
    public JudgmentResponse findById(Long id) {
        Judgment judgment = judgmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Judgment", id));
        return JudgmentResponse.from(judgment);
    }

    @Transactional(readOnly = true)
    public PagedResponse<JudgmentListResponse> findAll(int page, int size) {
        Page<Judgment> result = judgmentRepository.findByStatus("ACTIVE",
                PageRequest.of(page, size, Sort.by("judgmentDate").descending()));
        List<JudgmentListResponse> items = result.getContent().stream()
                .map(JudgmentListResponse::from).toList();
        return new PagedResponse<>(items, result.getTotalElements(), page, size);
    }
}
