# ধারা (Dhara) — AI Flowing Through the Law

AI-powered legal research platform for Bangladeshi lawyers and law students. Search statutes, case law, and SROs using natural language in both Bengali and English, with AI-generated answers backed by real citations.

## Quick Start

```bash
# 1. Start infrastructure
cp .env.example .env
docker compose up -d

# 2. Backend (port 8080)
cd backend && ./gradlew bootRun

# 3. RAG Service (port 8000)
cd rag-service && uv sync && uv run uvicorn app.main:app --reload --port 8000

# 4. Frontend (port 3000)
cd frontend && npm install && npm run dev

# 5. (Optional) Local LLM
ollama serve && ollama pull qwen3:14b
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Spring Boot 3.x (Java 21) |
| RAG Service | Python FastAPI |
| Frontend | Next.js 15 + TypeScript + Tailwind |
| Database | PostgreSQL 16 + pgvector |
| Cache | Redis 7 |
| Object Storage | MinIO |
| Message Queue | Kafka (KRaft) |
| Local LLM | Ollama (pluggable) |

## Project Structure

```
dhara/
├── backend/        → Spring Boot API gateway
├── rag-service/    → Python RAG pipeline
├── frontend/       → Next.js web app
├── infra/          → Nginx, monitoring configs
└── docs/           → Documentation
```

## License

All rights reserved.
