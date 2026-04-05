"""Factory that creates LLM providers from configuration."""

from app.providers.base import LLMProvider
from app.config import settings


def create_llm_provider(provider_name: str | None = None) -> LLMProvider:
    name = (provider_name or settings.llm_provider).lower()

    if name == "ollama":
        from app.providers.llm.ollama_provider import OllamaLLMProvider
        return OllamaLLMProvider()
    elif name == "deepseek":
        from app.providers.llm.deepseek_provider import DeepSeekLLMProvider
        return DeepSeekLLMProvider()
    elif name == "gemini":
        from app.providers.llm.gemini_provider import GeminiLLMProvider
        return GeminiLLMProvider()
    elif name == "claude":
        from app.providers.llm.claude_provider import ClaudeLLMProvider
        return ClaudeLLMProvider()
    elif name == "openai":
        from app.providers.llm.openai_provider import OpenAILLMProvider
        return OpenAILLMProvider()
    else:
        available = ["ollama", "deepseek", "gemini", "claude", "openai"]
        raise ValueError(f"Unknown LLM provider: '{name}'. Available: {available}")
