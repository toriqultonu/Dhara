package com.dhara.legal.statute;

import com.dhara.common.PagedResponse;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.Section;
import com.dhara.entity.Statute;
import com.dhara.legal.statute.dto.SectionResponse;
import com.dhara.legal.statute.dto.StatuteListResponse;
import com.dhara.legal.statute.dto.StatuteResponse;
import com.dhara.repository.SectionRepository;
import com.dhara.repository.StatuteRepository;
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
class StatuteServiceTest {

    @Mock
    private StatuteRepository statuteRepository;

    @Mock
    private SectionRepository sectionRepository;

    @InjectMocks
    private StatuteService statuteService;

    private Statute statute(Long id, String titleEn, int year) {
        Statute s = new Statute();
        s.setId(id);
        s.setActNumber("Act " + id);
        s.setTitleEn(titleEn);
        s.setYear(year);
        s.setStatus("ACTIVE");
        return s;
    }

    @Test
    void findById_existingStatute_returnsResponse() {
        when(statuteRepository.findById(1L)).thenReturn(Optional.of(statute(1L, "Contract Act", 1872)));

        StatuteResponse response = statuteService.findById(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.titleEn()).isEqualTo("Contract Act");
        assertThat(response.year()).isEqualTo(1872);
    }

    @Test
    void findById_missingStatute_throwsResourceNotFound() {
        when(statuteRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> statuteService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Statute")
                .hasMessageContaining("99");
    }

    @Test
    void findAll_withResults_returnsPagedResponse() {
        List<Statute> statutes = List.of(
                statute(1L, "Contract Act", 1872),
                statute(2L, "Penal Code", 1860));
        when(statuteRepository.findByStatus(eq("ACTIVE"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(statutes, PageRequest.of(0, 20), 2));

        PagedResponse<StatuteListResponse> response = statuteService.findAll(0, 20);

        assertThat(response.items()).hasSize(2);
        assertThat(response.items().get(0).titleEn()).isEqualTo("Contract Act");
        assertThat(response.total()).isEqualTo(2);
        assertThat(response.page()).isZero();
        assertThat(response.size()).isEqualTo(20);
    }

    @Test
    void findAll_emptyPage_returnsEmptyItems() {
        when(statuteRepository.findByStatus(eq("ACTIVE"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(3, 20), 0));

        PagedResponse<StatuteListResponse> response = statuteService.findAll(3, 20);

        assertThat(response.items()).isEmpty();
        assertThat(response.total()).isZero();
    }

    @Test
    void findSections_existingStatute_returnsSectionsInOrder() {
        Statute parent = statute(1L, "Contract Act", 1872);
        Section section = new Section();
        section.setId(10L);
        section.setStatute(parent);
        section.setSectionNumber("10");
        section.setTitleEn("What agreements are contracts");

        when(statuteRepository.existsById(1L)).thenReturn(true);
        when(sectionRepository.findByStatuteIdOrderBySectionNumberAsc(1L)).thenReturn(List.of(section));

        List<SectionResponse> sections = statuteService.findSections(1L);

        assertThat(sections).hasSize(1);
        assertThat(sections.get(0).sectionNumber()).isEqualTo("10");
    }

    @Test
    void findSections_missingStatute_throwsResourceNotFound() {
        when(statuteRepository.existsById(7L)).thenReturn(false);

        assertThatThrownBy(() -> statuteService.findSections(7L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
