# Dhara - Setup & Deployment Guide

Complete instructions for running the Dhara platform locally and in production, including how to swap AI models.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Production Deployment](#3-production-deployment)
4. [Changing AI Models](#4-changing-ai-models)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Prerequisites

### All Environments

| Tool | Version | Purpose |
|------|---------|---------|
| Git | 2.40+ | Source control |
| Docker + Docker Compose | 24+ / 2.20+ | Infrastructure services |

### Local Development (additional)

| Tool | Version | Purpose |
|------|---------|---------|
| Java JDK | 21 | Backend (Spring Boot) |
| Gradle | 8.x (or use wrapper) | Backend build |
| Python | 3.11+ | RAG service |
| uv | latest | Python package manager |
| Node.js | 22.x | Frontend (Next.js) |
| npm | 10+ | Frontend packages |
| Ollama | latest | Local LLM + embeddings |

### Hardware Requirements

| Setup | RAM | GPU | Disk |
|-------|-----|-----|------|
| Local (Ollama LLM) | 16 GB min | 8 GB VRAM recommended | 30 GB |
| Local (remote API only) | 8 GB min | Not needed | 15 GB |
| Production VPS | 16 GB+ | Optional | 50 GB+ SSD |

---

## 2. Local Development Setup

### Step 1: Clone and configure environment

```bash
git clone https://github.com/your-org/dhara.git
cd dhara

# Create .env from template
cp .env.example .env
```

Edit `.env` — the defaults work out of the box for local dev. Only fill in API keys if you want to use remote LLM providers.

### Step 2: Start infrastructure (Docker)

```bash
docker compose up -d
```

This starts:
- **PostgreSQL + pgvector** on `localhost:5432`
- **Redis** on `localhost:6379`
- **MinIO** on `localhost:9000` (console: `localhost:9001`)
- **Kafka** (KRaft mode) on `localhost:9092`
- **Kafka UI** on `localhost:8090`

Verify everything is running:

```bash
docker compose ps
```

### Step 3: Install and start Ollama (for local models)

> Ollama runs natively (not in Docker) to access your GPU directly.

```bash
# Install Ollama — https://ollama.com/download
# Windows: download installer from website
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama
ollama serve

# Pull models (in a separate terminal)
ollama pull qwen3:14b           # Default LLM (14B params, needs ~10GB VRAM)
ollama pull nomic-embed-text     # Only if using Ollama for embeddings
```

**Smaller model alternatives if you have limited VRAM:**

```bash
ollama pull qwen3:8b             # 8B — needs ~6GB VRAM
ollama pull qwen3:4b             # 4B — needs ~3GB VRAM
ollama pull phi4-mini             # 3.8B — needs ~3GB VRAM
ollama pull llama3.2:3b           # 3B — needs ~2GB VRAM
```

After pulling a different model, update `.env`:
```
OLLAMA_MODEL=qwen3:8b
```

### Step 4: Start the Backend (Spring Boot)

```bash
cd backend

# Generate the Gradle wrapper (first time only)
gradle wrapper

# Run the backend
./gradlew bootRun
```

On Windows (if `./gradlew` doesn't work):
```cmd
gradlew.bat bootRun
```

The backend starts on `http://localhost:8080`. Flyway automatically runs database migrations on first startup.

Verify:
```bash
curl http://localhost:8080/health
```

### Step 5: Start the RAG Service (Python FastAPI)

```bash
cd rag-service

# Create .env (if not using root-level .env)
cp .env.example .env

# Install dependencies
uv sync

# Run the service
uv run uvicorn app.main:app --reload --port 8000
```

The RAG service starts on `http://localhost:8000`.

Verify:
```bash
curl http://localhost:8000/health
```

> **Note:** If using BGE-M3 embeddings locally (`EMBEDDING_PROVIDER=bgem3`), the first startup downloads the model (~2GB). This is a one-time download.

### Step 6: Start the Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

The frontend starts on `http://localhost:3000`.

### Step 7: Verify the full stack

Open `http://localhost:3000` in your browser. You should see the Dhara landing page.

**Service endpoints summary:**

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| API docs (Swagger) | http://localhost:8080/swagger-ui.html |
| RAG Service | http://localhost:8000 |
| RAG docs | http://localhost:8000/docs |
| MinIO Console | http://localhost:9001 |
| Kafka UI | http://localhost:8090 |

### Stopping everything

```bash
# Stop infrastructure
docker compose down

# Stop Ollama (if running in terminal, just Ctrl+C)
# Or: taskkill /IM ollama.exe (Windows) / pkill ollama (Linux/Mac)
```

---

## 3. Production Deployment

### Option A: Single VPS with Docker Compose

#### Step 1: Prepare the server

```bash
# Install Docker + Docker Compose on your VPS
# (Ubuntu example)
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
```

#### Step 2: Clone and configure

```bash
git clone https://github.com/your-org/dhara.git
cd dhara
cp .env.example .env
```

Edit `.env` for production — **you MUST change these**:

```bash
# REQUIRED: Change these for security
DB_PASSWORD=<strong-random-password>
JWT_SECRET=<random-string-at-least-64-chars>
REDIS_PASSWORD=<strong-random-password>
MINIO_ROOT_USER=<change-from-default>
MINIO_ROOT_PASSWORD=<change-from-default>

# REQUIRED: Set your domain
CORS_ORIGINS=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com

# REQUIRED: Set at least one LLM API key
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-key-here

# RECOMMENDED: Use smart routing with multiple providers
LLM_ROUTER_MODE=smart
GEMINI_API_KEY=your-gemini-key
ANTHROPIC_API_KEY=sk-ant-your-key

# OPTIONAL: Payment
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-password
SSLCOMMERZ_SANDBOX=false
```

#### Step 3: Deploy

```bash
docker compose -f docker-compose.prod.yml up -d
```

This builds and starts all services: PostgreSQL, Redis, MinIO, Kafka, Backend, RAG Service, Frontend, and Nginx.

#### Step 4: Set up SSL (Let's Encrypt)

```bash
# Install certbot
sudo apt install -y certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certs for nginx
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem infra/nginx/certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem infra/nginx/certs/
```

Update `infra/nginx/nginx.conf` to add the SSL server block:

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    # ... same location blocks as port 80 ...
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

Then restart nginx:
```bash
docker compose -f docker-compose.prod.yml restart nginx
```

#### Step 5: Seed embeddings

After the database is populated with legal documents:

```bash
docker compose -f docker-compose.prod.yml exec rag-service \
  python scripts/embed_all_documents.py
```

### Option B: Frontend on Vercel + VPS for Backend

1. Deploy `frontend/` to Vercel (connect GitHub repo, set root directory to `frontend`)
2. Set Vercel env var: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
3. Run backend + RAG service + infrastructure on VPS using `docker-compose.prod.yml`
4. Point Nginx to handle only `/api/` routes

---

## 4. Changing AI Models

Dhara uses a **provider abstraction pattern** — every AI component (LLM, Embedding, Reranker) is configured through environment variables. **Zero code changes required** to switch models.

### 4.1 LLM (Answer Generation / Semantic Analysis)

The LLM generates answers from retrieved legal documents. Change it by editing `.env`:

#### Local Models (via Ollama)

```bash
# .env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:14b
```

To switch to a different local model:

```bash
# Pull the new model
ollama pull deepseek-r1:8b

# Update .env
OLLAMA_MODEL=deepseek-r1:8b
```

**Recommended local models for legal tasks:**

| Model | Size | VRAM | Best for |
|-------|------|------|----------|
| `qwen3:14b` | 14B | ~10GB | Best quality, Bengali support |
| `deepseek-r1:8b` | 8B | ~6GB | Good reasoning, English-heavy |
| `qwen3:8b` | 8B | ~6GB | Balanced quality + Bengali |
| `llama3.1:8b` | 8B | ~6GB | Strong English |
| `phi4-mini` | 3.8B | ~3GB | Fast, lighter tasks |
| `gemma3:4b` | 4B | ~3GB | Lightweight, Google model |

#### Remote API Models

```bash
# DeepSeek (cheapest, good quality)
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-key
DEEPSEEK_MODEL=deepseek-chat          # or deepseek-reasoner

# Google Gemini (best Bengali support)
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash         # or gemini-2.5-pro

# Anthropic Claude (best complex reasoning)
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-your-key
CLAUDE_MODEL=claude-sonnet-4-20250514   # or claude-opus-4-20250514

# OpenAI
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini              # or gpt-4o
```

#### Smart Routing (production recommended)

Smart routing automatically picks the best provider based on query complexity and user tier:

```bash
LLM_ROUTER_MODE=smart

# Simple queries → cheapest provider
# Bengali queries → best Bengali model
# Complex legal analysis → most capable model
# Premium users → premium models

# Set API keys for all providers you want in the rotation:
DEEPSEEK_API_KEY=sk-...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
```

The routing logic:
- **FREE/STUDENT tier, simple query** → DeepSeek (cheapest)
- **Bengali-heavy query** → Gemini (best multilingual)
- **Complex legal reasoning** → Claude (best analysis)
- **PROFESSIONAL/FIRM tier** → Premium models preferred
- **Fallback chain**: if primary fails, tries next provider automatically

### 4.2 Embedding Model (Vector Search)

The embedding model converts text to vectors for semantic search. This affects search quality significantly.

> **Important:** If you change the embedding model, you must **re-embed all documents** because different models produce incompatible vectors.

#### Local: BGE-M3 (default, recommended)

```bash
EMBEDDING_PROVIDER=bgem3
BGEM3_MODEL_PATH=BAAI/bge-m3
EMBEDDING_DIMENSION=1024
BGEM3_USE_FP16=true
```

BGE-M3 is multilingual (supports Bengali + English) and runs on CPU or GPU. The model auto-downloads on first use (~2GB).

#### Local: Ollama Embeddings

```bash
EMBEDDING_PROVIDER=ollama
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_DIMENSION=768
OLLAMA_BASE_URL=http://localhost:11434
```

First pull the model:
```bash
ollama pull nomic-embed-text
```

Other Ollama embedding models:
```bash
ollama pull mxbai-embed-large    # 334M params, dim 1024
ollama pull all-minilm            # 23M params, dim 384 (fast but lower quality)
```

> Update `EMBEDDING_DIMENSION` to match the model's output dimension.

#### Remote: OpenAI Embeddings

```bash
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-your-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small   # dim 1536, cheap
# or: text-embedding-3-large                     # dim 3072, better quality
EMBEDDING_DIMENSION=1536
```

#### After changing embedding model

You **must** re-embed all documents:

```bash
# Local dev
cd rag-service
uv run python scripts/embed_all_documents.py

# Production (Docker)
docker compose -f docker-compose.prod.yml exec rag-service \
  python scripts/embed_all_documents.py
```

If the new model has a different dimension, you also need a new Flyway migration to alter the `document_chunks.embedding` column:

```sql
-- Example: V7__update_embedding_dimension.sql
ALTER TABLE document_chunks
ALTER COLUMN embedding TYPE vector(1536);
```

### 4.3 Reranker Model

The reranker re-scores search results for better relevance. It runs after initial retrieval.

#### Local: BGE Reranker (default)

```bash
RERANKER_PROVIDER=bge
# Uses BAAI/bge-reranker-v2-m3 automatically
RERANKER_TOP_K=5
```

Auto-downloads on first use. Supports Bengali + English.

#### Remote: Cohere Rerank

```bash
RERANKER_PROVIDER=cohere
COHERE_API_KEY=your-key
# Uses rerank-multilingual-v3.0
RERANKER_TOP_K=5
```

#### Disable Reranking

```bash
RERANKER_PROVIDER=noop
```

This skips reranking entirely (faster, slightly lower quality).

### 4.4 Search Weight Tuning

Adjust the balance between vector (semantic) search and BM25 (keyword) search:

```bash
# More semantic (better for natural language questions)
SEARCH_VECTOR_WEIGHT=0.7
SEARCH_BM25_WEIGHT=0.3

# More keyword (better for exact statute/section references)
SEARCH_VECTOR_WEIGHT=0.4
SEARCH_BM25_WEIGHT=0.6

# Balanced (default)
SEARCH_VECTOR_WEIGHT=0.6
SEARCH_BM25_WEIGHT=0.4
```

### 4.5 Quick Reference: Model Configuration Cheat Sheet

#### Cheapest Local Setup (no GPU, no API keys)

```bash
LLM_PROVIDER=ollama
OLLAMA_MODEL=phi4-mini
EMBEDDING_PROVIDER=ollama
OLLAMA_EMBEDDING_MODEL=all-minilm
EMBEDDING_DIMENSION=384
RERANKER_PROVIDER=noop
```

#### Best Local Quality (GPU with 16GB VRAM)

```bash
LLM_PROVIDER=ollama
OLLAMA_MODEL=qwen3:14b
EMBEDDING_PROVIDER=bgem3
BGEM3_MODEL_PATH=BAAI/bge-m3
EMBEDDING_DIMENSION=1024
RERANKER_PROVIDER=bge
```

> **GPU conflict warning:** Don't run BGE-M3 embedding + LLM simultaneously on 16GB VRAM. Either embed documents in a batch beforehand, or use CPU for embeddings (`BGEM3_USE_FP16=false`).

#### Best Remote Quality (API keys, no GPU needed)

```bash
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-20250514
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
EMBEDDING_DIMENSION=3072
RERANKER_PROVIDER=cohere
COHERE_API_KEY=...
```

#### Production Recommended (smart routing + local embeddings)

```bash
LLM_ROUTER_MODE=smart
DEEPSEEK_API_KEY=sk-...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
EMBEDDING_PROVIDER=bgem3
EMBEDDING_DIMENSION=1024
RERANKER_PROVIDER=bge
```

---

## 5. Troubleshooting

### Infrastructure

| Problem | Solution |
|---------|----------|
| `docker compose up` fails | Check Docker is running: `docker info` |
| Port 5432 already in use | Stop local PostgreSQL: `sudo systemctl stop postgresql` |
| Kafka fails on Alpine | Ensure `lz4` compression (not snappy) in config |
| MinIO won't start | Check port 9000/9001 not used by another service |

### Backend

| Problem | Solution |
|---------|----------|
| Flyway checksum mismatch | Never edit existing migrations. Create a new `V{N}__` file |
| `gradlew` not found | Run `gradle wrapper` in backend/ first |
| Connection refused to DB | Ensure `docker compose up -d` ran successfully |
| JWT errors | Check `JWT_SECRET` is at least 32 chars |

### RAG Service

| Problem | Solution |
|---------|----------|
| BGE-M3 download slow | First run downloads ~2GB. Wait for it to finish |
| CUDA out of memory | Use a smaller model or set `BGEM3_USE_FP16=false` |
| Ollama connection refused | Ensure `ollama serve` is running |
| `ModuleNotFoundError` | Run `uv sync` to install dependencies |

### Frontend

| Problem | Solution |
|---------|----------|
| API calls fail | Check `NEXT_PUBLIC_API_URL` matches backend URL |
| Bengali text not rendering | Noto Sans Bengali font loads from Google Fonts |
| Build fails | Run `npm install` then `npm run build` |

### Model-Specific

| Problem | Solution |
|---------|----------|
| Changed embedding model, search broken | Must re-run `embed_all_documents.py` |
| Embedding dimension mismatch | Update `EMBEDDING_DIMENSION` AND the DB column |
| DeepSeek API 429 errors | Rate limited. Add more providers for fallback |
| Gemini safety filter blocking | Legal content may trigger filters. Use Claude instead |

---

## Appendix: All Environment Variables

See `.env.example` in the project root for the complete list with defaults and descriptions.

### Restart behavior

After changing `.env`:

| What changed | What to restart |
|-------------|----------------|
| `LLM_PROVIDER`, `LLM_MODEL`, API keys | RAG service only |
| `EMBEDDING_PROVIDER`, `EMBEDDING_MODEL` | RAG service + re-embed documents |
| `RERANKER_PROVIDER` | RAG service only |
| `SEARCH_*_WEIGHT` | RAG service only |
| `DB_*`, `REDIS_*` | Backend + RAG service |
| `JWT_SECRET` | Backend only (all existing tokens invalidate) |
| `NEXT_PUBLIC_*` | Frontend (requires rebuild in production) |

```bash
# Restart a single service (local dev — just Ctrl+C and re-run)

# Restart a single service (Docker production)
docker compose -f docker-compose.prod.yml restart rag-service
docker compose -f docker-compose.prod.yml restart backend

# Frontend needs rebuild if NEXT_PUBLIC_* changed
docker compose -f docker-compose.prod.yml up -d --build frontend
```
