CREATE TABLE statutes (
    id BIGSERIAL PRIMARY KEY,
    act_number VARCHAR(100) NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    title_bn VARCHAR(500),
    year INTEGER NOT NULL,
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    effective_date DATE,
    repealed_by_id BIGINT REFERENCES statutes(id),
    full_text TEXT,
    source_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sections (
    id BIGSERIAL PRIMARY KEY,
    statute_id BIGINT NOT NULL REFERENCES statutes(id) ON DELETE CASCADE,
    section_number VARCHAR(50) NOT NULL,
    title_en VARCHAR(500),
    title_bn VARCHAR(500),
    content_en TEXT,
    content_bn TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE judgments (
    id BIGSERIAL PRIMARY KEY,
    case_name VARCHAR(500) NOT NULL,
    citation VARCHAR(200) NOT NULL,
    court VARCHAR(100),
    bench TEXT,
    judgment_date DATE,
    headnotes_en TEXT,
    headnotes_bn TEXT,
    full_text TEXT,
    source_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sros (
    id BIGSERIAL PRIMARY KEY,
    sro_number VARCHAR(100) NOT NULL,
    title_en VARCHAR(500),
    title_bn VARCHAR(500),
    gazette_date DATE,
    issuing_ministry VARCHAR(200),
    full_text TEXT,
    source_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_statutes_year ON statutes(year);
CREATE INDEX idx_statutes_status ON statutes(status);
CREATE INDEX idx_statutes_category ON statutes(category);
CREATE INDEX idx_sections_statute_id ON sections(statute_id);
CREATE INDEX idx_judgments_court ON judgments(court);
CREATE INDEX idx_judgments_status ON judgments(status);
CREATE INDEX idx_judgments_date ON judgments(judgment_date);
CREATE INDEX idx_sros_gazette_date ON sros(gazette_date);
CREATE INDEX idx_sros_status ON sros(status);
