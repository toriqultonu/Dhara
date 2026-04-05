"""All configuration via environment variables. No hardcoded values."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "dhara-rag"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://dhara:password@localhost:5432/dhara"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # LLM Provider
    llm_provider: str = "ollama"
    llm_router_mode: str = "local"
    llm_router_providers: list[str] = ["deepseek", "gemini", "claude"]

    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3:14b"

    # DeepSeek
    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-chat"
    deepseek_base_url: str = "https://api.deepseek.com"

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # Claude
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-20250514"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str = "https://api.openai.com/v1"

    # Embedding
    embedding_provider: str = "bgem3"
    embedding_dimension: int = 1024
    bgem3_model_path: str = "BAAI/bge-m3"
    bgem3_use_fp16: bool = True
    ollama_embedding_model: str = "nomic-embed-text"
    openai_embedding_model: str = "text-embedding-3-small"

    # Reranker
    reranker_provider: str = "bge"
    reranker_top_k: int = 5
    cohere_api_key: str = ""
    cohere_rerank_model: str = "rerank-multilingual-v3.0"

    # Search
    search_vector_weight: float = 0.6
    search_bm25_weight: float = 0.4
    search_top_k: int = 10

    # Kafka
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_usage_topic: str = "dhara.usage"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
