package com.dhara.legal.judgment;

import com.dhara.common.PagedResponse;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.Judgment;
import com.dhara.legal.judgment.dto.JudgmentListResponse;
import com.dhara.legal.judgment.dto.JudgmentResponse;
import com.dhara.repository.JudgmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JudgmentServiceTest {

    @Mock
    private JudgmentRepository judgmentRepository;

    @InjectMocks
    private JudgmentService judgmentService;

    private Judgment judgment(Long id, String caseName) {
        Judgment j = new Judgment();
        j.setId(id);
        j.setCaseName(caseName);
        j.setCitation("70 DLR (AD) 1");
        j.setStatus("ACTIVE");
        return j;
    }

    @Test
    void findById_existingJudgment_returnsResponse() {
        when(judgmentRepository.findById(5L)).thenReturn(Optional.of(judgment(5L, "State vs Rahman")));

        JudgmentResponse response = judgmentService.findById(5L);

        assertThat(response.id()).isEqualTo(5L);
        assertThat(response.caseName()).isEqualTo("State vs Rahman");
        assertThat(response.citation()).isEqualTo("70 DLR (AD) 1");
    }

    @Test
    void findById_missingJudgment_throwsResourceNotFound() {
        when(judgmentRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> judgmentService.findById(404L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Judgment");
    }

    @Test
    void findAll_withResults_returnsPagedResponse() {
        when(judgmentRepository.findByStatus(eq("ACTIVE"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(judgment(1L, "A vs B")), PageRequest.of(0, 10), 1));

        PagedResponse<JudgmentListResponse> response = judgmentService.findAll(0, 10);

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).caseName()).isEqualTo("A vs B");
        assertThat(response.total()).isEqualTo(1);
    }
}
