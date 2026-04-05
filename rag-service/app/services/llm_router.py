"""Smart LLM Router — routes queries to the cheapest adequate provider."""

import logging
from app.providers.base import LLMProvider, LLMResponse
from app.providers.llm.factory import create_llm_provider
from app.config import settings

logger = logging.getLogger(__name__)


class LLMRouter:
    def __init__(self):
        self._mode = settings.llm_router_mode

        if self._mode == "local":
            self._default_provider = create_llm_provider("ollama")
        else:
            self._providers: dict[str, LLMProvider] = {}
            for name in settings.llm_router_providers:
                try:
                    self._providers[name] = create_llm_provider(name)
                except Exception as e:
                    logger.warning(f"Failed to init LLM provider '{name}': {e}")
            if "ollama" not in self._providers:
                try:
                    self._providers["ollama"] = create_llm_provider("ollama")
                except Exception:
                    pass

    async def generate(
        self, prompt: str, system_prompt: str | None = None,
        complexity: float = 0.5, user_tier: str = "FREE", **kwargs,
    ) -> LLMResponse:
        if self._mode == "local":
            return await self._default_provider.generate(prompt, system_prompt, **kwargs)

        provider_name = self._select_provider(complexity, user_tier)
        provider = self._providers.get(provider_name)

        if not provider:
            for fallback in ["gemini", "deepseek", "ollama"]:
                if fallback in self._providers:
                    provider = self._providers[fallback]
                    break

        if not provider:
            raise RuntimeError("No LLM provider available")

        try:
            return await provider.generate(prompt, system_prompt, **kwargs)
        except Exception:
            return await self._fallback_generate(prompt, system_prompt, exclude=provider_name, **kwargs)

    def _select_provider(self, complexity: float, user_tier: str) -> str:
        if complexity < 0.5:
            return "deepseek"
        elif complexity < 0.8 or user_tier in ("FREE", "STUDENT"):
            return "gemini"
        else:
            return "claude"

    async def _fallback_generate(self, prompt, system_prompt, exclude, **kwargs) -> LLMResponse:
        for name in ["gemini", "deepseek", "ollama"]:
            if name == exclude or name not in self._providers:
                continue
            try:
                return await self._providers[name].generate(prompt, system_prompt, **kwargs)
            except Exception:
                continue
        raise RuntimeError("All LLM providers failed")
