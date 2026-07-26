package com.dhara.legal.sro;

import com.dhara.common.PagedResponse;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.Sro;
import com.dhara.legal.sro.dto.SroResponse;
import com.dhara.repository.SroRepository;
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
class SroServiceTest {

    @Mock
    private SroRepository sroRepository;

    @InjectMocks
    private SroService sroService;

    private Sro sro(Long id, String number) {
        Sro s = new Sro();
        s.setId(id);
        s.setSroNumber(number);
        s.setStatus("ACTIVE");
        return s;
    }

    @Test
    void findById_existingSro_returnsResponse() {
        when(sroRepository.findById(3L)).thenReturn(Optional.of(sro(3L, "SRO-123/2024")));

        SroResponse response = sroService.findById(3L);

        assertThat(response.id()).isEqualTo(3L);
        assertThat(response.sroNumber()).isEqualTo("SRO-123/2024");
    }

    @Test
    void findById_missingSro_throwsResourceNotFound() {
        when(sroRepository.findById(9L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sroService.findById(9L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("SRO");
    }

    @Test
    void findAll_withResults_returnsPagedResponse() {
        when(sroRepository.findByStatus(eq("ACTIVE"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sro(1L, "SRO-1")), PageRequest.of(0, 20), 1));

        PagedResponse<SroResponse> response = sroService.findAll(0, 20);

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).sroNumber()).isEqualTo("SRO-1");
        assertThat(response.total()).isEqualTo(1);
    }
}
