package com.dhara.repository;

import com.dhara.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByStatuteIdOrderBySectionNumberAsc(Long statuteId);
}
