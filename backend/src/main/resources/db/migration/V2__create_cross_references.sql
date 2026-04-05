CREATE TABLE judgment_statute_citations (
    id BIGSERIAL PRIMARY KEY,
    judgment_id BIGINT NOT NULL REFERENCES judgments(id) ON DELETE CASCADE,
    statute_id BIGINT NOT NULL REFERENCES statutes(id) ON DELETE CASCADE,
    section_number VARCHAR(50),
    context TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE judgment_judgment_citations (
    id BIGSERIAL PRIMARY KEY,
    citing_judgment_id BIGINT NOT NULL REFERENCES judgments(id) ON DELETE CASCADE,
    cited_judgment_id BIGINT NOT NULL REFERENCES judgments(id) ON DELETE CASCADE,
    context TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jsc_judgment ON judgment_statute_citations(judgment_id);
CREATE INDEX idx_jsc_statute ON judgment_statute_citations(statute_id);
CREATE INDEX idx_jjc_citing ON judgment_judgment_citations(citing_judgment_id);
CREATE INDEX idx_jjc_cited ON judgment_judgment_citations(cited_judgment_id);
