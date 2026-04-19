CREATE TABLE document_templates (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    preview TEXT,
    popularity INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE legal_clauses (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_documents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'other',
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    content TEXT,
    tags TEXT[],
    shared BOOLEAN DEFAULT FALSE,
    share_url VARCHAR(500),
    share_permission VARCHAR(20),
    share_expires_at TIMESTAMPTZ,
    template_id BIGINT REFERENCES document_templates(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analysis_sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    file_name VARCHAR(500) NOT NULL,
    page_count INTEGER,
    word_count INTEGER,
    extracted_text TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_docs_user ON user_documents(user_id);
CREATE INDEX idx_user_docs_status ON user_documents(status);
CREATE INDEX idx_user_docs_category ON user_documents(category);
CREATE INDEX idx_templates_category ON document_templates(category);
CREATE INDEX idx_templates_status ON document_templates(status);
CREATE INDEX idx_clauses_category ON legal_clauses(category);
CREATE INDEX idx_analysis_user ON analysis_sessions(user_id);
