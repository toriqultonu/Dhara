# Dhara - RAG Data Pipeline Guide

How to add legal documents (PDFs, text) to the vector dataset and run the RAG service end-to-end.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Where Files Live](#2-where-files-live)
3. [Step 1 — Start Infrastructure](#3-step-1--start-infrastructure)
4. [Step 2 — Configure the RAG Service](#4-step-2--configure-the-rag-service)
5. [Step 3 — Load Documents into PostgreSQL](#5-step-3--load-documents-into-postgresql)
6. [Step 4 — Run the Embedding Pipeline](#6-step-4--run-the-embedding-pipeline)
7. [Step 5 — Start the RAG Service](#7-step-5--start-the-rag-service)
8. [Step 6 — Test the Pipeline](#8-step-6--test-the-pipeline)
9. [Adding More Data Later](#9-adding-more-data-later)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Architecture Overview

```
PDF / text files
      │
      ▼
MinIO (object storage)        ← raw file archive
      │
      ▼
data-pipeline parsers          ← extract text from PDFs (OCR if scanned)
      │
      ▼
PostgreSQL tables
  ├── statutes.full_text
  ├── judgments.full_text
  └── sros.content
      │
      ▼
embed_all_documents.py         ← generate 1024-dim vectors
      │
      ▼
document_chunks table
  └── embedding vector(1024)   ← HNSW index, ready for search
      │
      ▼
RAG Service (FastAPI :8000)    ← hybrid search + LLM answer generation
      │
      ▼
Backend (Spring Boot :8080)    ← proxies requests from frontend
      │
      ▼
Frontend (Next.js :3000)
```

**Key rule:** The embedding script is idempotent. It only processes documents not yet in `document_chunks`. Safe to re-run at any time.

---

## 2. Where Files Live

| Layer | Location | Purpose |
|-------|----------|---------|
| Raw PDFs | MinIO bucket `dhara-documents/` | Original source files |
| Extracted text | PostgreSQL `statutes`, `judgments`, `sros` tables | Searchable text |
| Vectors | PostgreSQL `document_chunks.embedding` | Semantic search index |

### MinIO folder structure

```
dhara-documents/
├── statutes/       ← Acts, Ordinances (PDF or text)
├── judgments/      ← Supreme Court case law PDFs
└── sros/           ← Bangladesh Gazette SROs
```

Access the MinIO console at `http://localhost:9001`
- Default credentials: `minioadmin / minioadmin` (change in production)

---

## 3. Step 1 — Start Infrastructure

```bash
cd ~/Dhara
docker compose up -d
```

Verify all services are healthy:

```bash
docker compose ps
```

Expected services: `postgres`, `redis`, `minio`, `kafka`

---

## 4. Step 2 — Configure the RAG Service

Edit `rag-service/.env`. Choose a setup based on your hardware:

### Option A — Fully local (GPU, no API keys)

```env
EMBEDDING_PROVIDER=bgem3
LLM_PROVIDER=ollama
OLLAMA_MODEL=qwen3:14b          # or deepseek-r1:8b for less VRAM
RERANKER_PROVIDER=bge
```

Requires Ollama running natively (`ollama serve`) with the model pulled:
```bash
ollama pull qwen3:14b
```

> **GPU conflict warning:** BGE-M3 + LLM on 16GB VRAM will conflict.
> Either embed documents in batch first (then restart with LLM only),
> or set `BGEM3_USE_FP16=false` to force CPU for embeddings.

### Option B — Cloud APIs (no GPU needed)

```env
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-your-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

LLM_PROVIDER=gemini             # or deepseek, claude
GEMINI_API_KEY=your-key

RERANKER_PROVIDER=noop          # skip if no Cohere key
```

### Option C — Mixed (local embeddings + cloud LLM)

```env
EMBEDDING_PROVIDER=bgem3        # local, no API key needed
LLM_PROVIDER=deepseek           # cheap remote API
DEEPSEEK_API_KEY=sk-your-key
RERANKER_PROVIDER=bge           # local
```

---

## 5. Step 3 — Load Documents into PostgreSQL

The dummy seed (Flyway `V7`) already inserts 7 statutes, 6 judgments, and 3 SROs for development. For real data, use one of these methods:

### Method A — Direct SQL (quickest for dev)

Connect to the database and insert directly:

```bash
docker exec -it dhara-postgres-1 psql -U dhara -d dhara
```

```sql
-- Add a statute
INSERT INTO statutes (act_number, title_en, title_bn, year, category, status, effective_date, full_text, source_url)
VALUES (
  'Act No. VIII of 2023',
  'The Cyber Security Act, 2023',
  'সাইবার নিরাপত্তা আইন, ২০২৩',
  2023, 'Cyber Law', 'ACTIVE', '2023-09-18',
  'Full text of the act goes here...',
  'http://bdlaws.minlaw.gov.bd'
);

-- Add a judgment
INSERT INTO judgments (case_name, citation, court, bench, judgment_date, full_text, status)
VALUES (
  'My Case v. Respondent',
  '2024 BLD (HCD) 100',
  'High Court Division, Supreme Court of Bangladesh',
  'Justice Name',
  '2024-01-15',
  'Full judgment text goes here...',
  'ACTIVE'
);

-- Add an SRO
INSERT INTO sros (sro_number, title_en, title_bn, gazette_date, issuing_ministry, content, status)
VALUES (
  'SRO No. 50-Law/2024',
  'Some Rules, 2024',
  'কিছু বিধিমালা, ২০২৪',
  '2024-03-01',
  'Ministry of Law',
  'Full SRO content goes here...',
  'ACTIVE'
);
```

### Method B — Flyway migration (correct way for permanent data)

Create a new migration file. Never edit existing ones.

```bash
# File: backend/src/main/resources/db/migration/V8__seed_more_legal_data.sql
```

```sql
INSERT INTO statutes (act_number, title_en, ...) VALUES (...);
```

The migration runs automatically on next backend startup.

### Method C — Load from PDF (Python script)

For bulk PDF loading, use PyMuPDF to extract text and insert into PostgreSQL:

```bash
cd ~/Dhara/rag-service
uv add pymupdf psycopg2-binary
```

```python
# scripts/load_pdf.py
import fitz  # pymupdf
import psycopg2
import sys

def load_statute_pdf(pdf_path: str, act_number: str, title_en: str, title_bn: str, year: int, category: str):
    # Extract text from PDF
    doc = fitz.open(pdf_path)
    full_text = "\n".join(page.get_text() for page in doc)
    doc.close()

    # Insert into PostgreSQL
    conn = psycopg2.connect("postgresql://dhara:password@localhost:5432/dhara")
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO statutes (act_number, title_en, title_bn, year, category, status, full_text)
        VALUES (%s, %s, %s, %s, %s, 'ACTIVE', %s)
        ON CONFLICT (act_number) DO UPDATE SET full_text = EXCLUDED.full_text
    """, (act_number, title_en, title_bn, year, category, full_text))
    conn.commit()
    cur.close()
    conn.close()
    print(f"Loaded: {title_en} ({len(full_text)} chars)")

if __name__ == "__main__":
    load_statute_pdf(
        pdf_path=sys.argv[1],
        act_number="Act No. X of 2024",
        title_en="My Act Title",
        title_bn="আমার আইনের শিরোনাম",
        year=2024,
        category="Civil Law",
    )
```

```bash
uv run python scripts/load_pdf.py /path/to/my_act.pdf
```

---

## 6. Step 4 — Run the Embedding Pipeline

Once documents are in PostgreSQL, generate their vector embeddings:

```bash
cd ~/Dhara/rag-service

# Install dependencies (first time only)
uv sync

# Run the embedding pipeline
uv run python scripts/embed_all_documents.py
```

**What it does:**
- Reads all rows from `statutes`, `judgments`, and `sros`
- Skips any that already have entries in `document_chunks`
- Sends text in batches of 32 to the configured embedding provider
- Stores `vector(1024)` embeddings in `document_chunks`

**Expected output:**
```
2024-01-15 10:00:00 INFO Processing statute from statutes...
2024-01-15 10:00:05 INFO   Embedded 7 statute documents so far
2024-01-15 10:00:06 INFO Processing judgment from judgments...
2024-01-15 10:00:10 INFO   Embedded 6 judgment documents so far
2024-01-15 10:00:11 INFO Processing sro from sros...
2024-01-15 10:00:12 INFO   Embedded 3 sro documents so far
2024-01-15 10:00:12 INFO Done. Embedded 16 total documents in 12.3 seconds.
```

> **Note:** If using BGE-M3 for the first time, the model downloads ~2GB before processing starts. This is a one-time download.

---

## 7. Step 5 — Start the RAG Service

```bash
cd ~/Dhara/rag-service
uv run uvicorn app.main:app --reload --port 8000
```

Verify it's healthy:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "providers": {
    "llm": "ollama",
    "embedding": "bgem3",
    "reranker": "bge",
    "router_mode": "local"
  }
}
```

Interactive API docs: `http://localhost:8000/docs`

---

## 8. Step 6 — Test the Pipeline

### Search endpoint

```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "murder punishment penal code", "top_k": 5}'
```

### Ask / RAG endpoint (full answer generation)

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the punishment for murder under Bangladesh law?"}'
```

### Bengali query test

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "বাংলাদেশে খুনের শাস্তি কী?"}'
```

If you get results with citations, the full pipeline is working correctly.

---

## 9. Adding More Data Later

The process is always the same:

```
Add rows to statutes / judgments / sros
              ↓
uv run python scripts/embed_all_documents.py
```

The script is idempotent — it skips already-embedded documents and only processes new ones.

### Re-embedding all documents

Only needed if you change the embedding model:

```bash
# 1. Clear existing chunks
docker exec -it dhara-postgres-1 psql -U dhara -d dhara \
  -c "TRUNCATE document_chunks;"

# 2. Update EMBEDDING_PROVIDER / EMBEDDING_DIMENSION in rag-service/.env
#    If dimension changed, also create a new Flyway migration:
#    ALTER TABLE document_chunks ALTER COLUMN embedding TYPE vector(NEW_DIM);

# 3. Re-run the embedding script
cd ~/Dhara/rag-service
uv run python scripts/embed_all_documents.py
```

---

## 10. Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `embed_all_documents.py` embeds 0 documents | No data in source tables | Check `SELECT COUNT(*) FROM statutes;` |
| `asyncpg connection error` | Wrong DB URL | Check `DATABASE_URL` in `rag-service/.env` matches Docker credentials |
| BGE-M3 hangs on first run | Downloading ~2GB model | Wait — it's a one-time download |
| `CUDA out of memory` | GPU conflict between embedder and LLM | Set `BGEM3_USE_FP16=false` to use CPU for embeddings |
| `Ollama connection refused` | Ollama not running | Run `ollama serve` in a separate terminal |
| Search returns no results | `document_chunks` is empty | Run the embedding script |
| Embedding dimension mismatch | Changed embedding model without updating DB | Create a new Flyway migration to alter the `embedding` column type |
| `uv: command not found` | uv not installed | Install: `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
