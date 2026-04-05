CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
    id BIGSERIAL PRIMARY KEY,
    source_type VARCHAR(20) NOT NULL,
    source_id BIGINT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    content_tsvector tsvector,
    embedding vector(1024),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chunks_source ON document_chunks(source_type, source_id);
CREATE INDEX idx_chunks_tsvector ON document_chunks USING GIN(content_tsvector);
CREATE INDEX idx_chunks_embedding ON document_chunks USING hnsw(embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 200);

CREATE OR REPLACE FUNCTION update_content_tsvector() RETURNS trigger AS $$
BEGIN
    NEW.content_tsvector := to_tsvector('english', COALESCE(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_content_tsvector
    BEFORE INSERT OR UPDATE OF content ON document_chunks
    FOR EACH ROW EXECUTE FUNCTION update_content_tsvector();
