"""Tests for LLM router smart routing logic."""

import pytest
from unittest.mock import AsyncMock, MagicMock

from app.services.llm_router import LLMRouter
from app.providers.base import LLMResponse


@pytest.fixture
def mock_providers() -> dict[str, AsyncMock]:
    providers = {}
    for name in ["ollama", "deepseek", "gemini", "claude"]:
        provider = AsyncMock()
        provider.generate.return_value = LLMResponse(
            text=f"Response from {name}",
            model=f"{name}-model",
            provider=name,
            tokens_used=100,
            latency_ms=200.0,
            cost_usd=0.001,
        )
        provider.health_check.return_value = True
        providers[name] = provider
    return providers


class TestLLMRouter:
    def test_local_mode_uses_primary(self, mock_providers: dict) -> None:
        router = LLMRouter(
            providers=mock_providers,
            mode="local",
            primary_provider="ollama",
        )
        assert router.primary_provider == "ollama"

    @pytest.mark.asyncio
    async def test_generate_uses_primary_in_local_mode(self, mock_providers: dict) -> None:
        router = LLMRouter(
            providers=mock_providers,
            mode="local",
            primary_provider="ollama",
        )
        result = await router.generate("What is section 302?", user_tier="FREE")
        mock_providers["ollama"].generate.assert_called_once()
        assert result.provider == "ollama"

    @pytest.mark.asyncio
    async def test_fallback_on_provider_failure(self, mock_providers: dict) -> None:
        mock_providers["ollama"].generate.side_effect = Exception("Ollama down")
        router = LLMRouter(
            providers=mock_providers,
            mode="local",
            primary_provider="ollama",
            fallback_order=["deepseek", "gemini"],
        )
        result = await router.generate("Test query", user_tier="FREE")
        assert result.provider == "deepseek"

    @pytest.mark.asyncio
    async def test_all_providers_fail_raises(self, mock_providers: dict) -> None:
        for p in mock_providers.values():
            p.generate.side_effect = Exception("Provider down")
        router = LLMRouter(
            providers=mock_providers,
            mode="local",
            primary_provider="ollama",
            fallback_order=["deepseek", "gemini", "claude"],
        )
        with pytest.raises(Exception, match="All LLM providers failed"):
            await router.generate("Test query", user_tier="FREE")
