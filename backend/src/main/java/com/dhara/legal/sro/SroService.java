package com.dhara.legal.sro;

import com.dhara.common.PagedResponse;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.Sro;
import com.dhara.legal.sro.dto.SroResponse;
import com.dhara.repository.SroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SroService {

    private final SroRepository sroRepository;

    @Transactional(readOnly = true)
    public SroResponse findById(Long id) {
        Sro sro = sroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SRO", id));
        return SroResponse.from(sro);
    }

    @Transactional(readOnly = true)
    public PagedResponse<SroResponse> findAll(int page, int size) {
        Page<Sro> result = sroRepository.findByStatus("ACTIVE",
                PageRequest.of(page, size, Sort.by("gazetteDate").descending()));
        List<SroResponse> items = result.getContent().stream()
                .map(SroResponse::from).toList();
        return new PagedResponse<>(items, result.getTotalElements(), page, size);
    }
}
