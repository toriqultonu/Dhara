package com.dhara.clause;

import com.dhara.clause.dto.ClauseResponse;
import com.dhara.entity.LegalClause;
import com.dhara.repository.LegalClauseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClauseServiceTest {

    @Mock
    private LegalClauseRepository clauseRepository;

    @InjectMocks
    private ClauseService clauseService;

    private LegalClause clause(Long id, String title, String category) {
        LegalClause c = new LegalClause();
        c.setId(id);
        c.setTitle(title);
        c.setCategory(category);
        c.setContent("clause text");
        return c;
    }

    @Test
    void findAll_withCategory_queriesByCategory() {
        when(clauseRepository.findByStatusAndCategoryOrderByTitleAsc("ACTIVE", "termination"))
                .thenReturn(List.of(clause(1L, "Notice Period", "termination")));

        List<ClauseResponse> result = clauseService.findAll("termination");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).title()).isEqualTo("Notice Period");
        verify(clauseRepository, never()).findByStatusOrderByTitleAsc("ACTIVE");
    }

    @Test
    void findAll_withoutCategory_returnsAllActiveClauses() {
        when(clauseRepository.findByStatusOrderByTitleAsc("ACTIVE"))
                .thenReturn(List.of(clause(1L, "A", "x"), clause(2L, "B", "y")));

        List<ClauseResponse> result = clauseService.findAll(null);

        assertThat(result).hasSize(2);
    }

    @Test
    void findAll_blankCategory_treatedAsNoCategory() {
        when(clauseRepository.findByStatusOrderByTitleAsc("ACTIVE")).thenReturn(List.of());

        List<ClauseResponse> result = clauseService.findAll("  ");

        assertThat(result).isEmpty();
    }
}
