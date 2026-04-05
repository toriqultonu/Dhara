package com.dhara.legal.statute.dto;

import com.dhara.entity.Section;

public record SectionResponse(
        Long id, String sectionNumber, String titleEn, String titleBn,
        String contentEn, String contentBn, String status
) {
    public static SectionResponse from(Section e) {
        return new SectionResponse(e.getId(), e.getSectionNumber(), e.getTitleEn(), e.getTitleBn(),
                e.getContentEn(), e.getContentBn(), e.getStatus());
    }
}
