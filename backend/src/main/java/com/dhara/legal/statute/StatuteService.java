package com.dhara.legal.statute;

import com.dhara.common.PagedResponse;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.Statute;
import com.dhara.legal.statute.dto.StatuteListResponse;
import com.dhara.legal.statute.dto.StatuteResponse;
import com.dhara.legal.statute.dto.SectionResponse;
import com.dhara.repository.SectionRepository;
import com.dhara.repository.StatuteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StatuteService {

    private final StatuteRepository statuteRepository;
    private final SectionRepository sectionRepository;

    @Transactional(readOnly = true)
    public StatuteResponse findById(Long id) {
        Statute statute = statuteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Statute", id));
        return StatuteResponse.from(statute);
    }

    @Transactional(readOnly = true)
    public PagedResponse<StatuteListResponse> findAll(int page, int size) {
        Page<Statute> result = statuteRepository.findByStatus("ACTIVE",
                PageRequest.of(page, size, Sort.by("year").descending()));
        List<StatuteListResponse> items = result.getContent().stream()
                .map(StatuteListResponse::from).toList();
        return new PagedResponse<>(items, result.getTotalElements(), page, size);
    }

    @Transactional(readOnly = true)
    public List<SectionResponse> findSections(Long statuteId) {
        if (!statuteRepository.existsById(statuteId)) {
            throw new ResourceNotFoundException("Statute", statuteId);
        }
        return sectionRepository.findByStatuteIdOrderBySectionNumberAsc(statuteId)
                .stream().map(SectionResponse::from).toList();
    }
}
