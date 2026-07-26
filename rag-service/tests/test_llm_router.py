"""Tests for LLM router smart routing logic."""

from unittest.mock import AsyncMock

import pytest

from app.config import settings
from app.providers.base import LLMResponse
from app.services.llm_router import LLMRouter

PROVIDER_NAMES = ["ollama", "deepseek", "gemini", "claude"]


def make_response(name: str) -> LLMResponse:
    return LLMResponse(
        text=f"Response from {name}", model=f"{name}-model", provider=name,
        input_tokens=100, output_tokens=50, cost_usd=0.001,
    )


@pytest.fixture
def mock_providers() -> dict[str, AsyncMock]:
    providers: dict[str, AsyncMock] = {}
    for name in PROVIDER_NAMES:
        provider = AsyncMock()
        provider.generate.return_value = make_response(name)
        provider.health_check.return_value = True
        providers[name] = provider
    return providers


@pytest.fixture
def patch_factory(monkeypatch: pytest.MonkeyPatch, mock_providers: dict[str, AsyncMock]):
    def fake_create(provider_name: str | None = None) -> AsyncMock:
        return mock_providers[provider_name or "ollama"]

    monkeypatch.setattr("app.services.llm_router.create_llm_provider", fake_create)
    return fake_create


@pytest.fixture
def local_mode(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "llm_router_mode", "local")


@pytest.fixture
def smart_mode(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "llm_router_mode", "smart")
    monkeypatch.setattr(settings, "llm_router_providers", ["deepseek", "gemini", "claude"])


class TestLocalMode:
    async def test_local_mode_routes_to_ollama(
        self, local_mode: None, patch_factory, mock_providers: dict[str, AsyncMock]
    ) -> None:
        router = LLMRouter()
        result = await router.generate("What is section 302?", user_tier="FREE")
        mock_providers["ollama"].generate.assert_awaited_once()
        assert result.provider == "ollama"
        for name in ("deepseek", "gemini", "claude"):
            mock_providers[name].generate.assert_not_awaited()


class TestSmartMode:
    async def test_low_complexity_routes_to_deepseek(
        self, smart_mode: None, patch_factory, mock_providers: dict[str, AsyncMock]
    ) -> None:
        router = LLMRouter()
        result = await router.generate("Simple query", complexity=0.2, user_tier="FREE")
        assert result.provider == "deepseek"
        mock_providers["deepseek"].generate.assert_awaited_once()

    async def test_mid_complexity_routes_to_gemini(
        self, smart_mode: None, patch_factory, mock_providers: dict[str, AsyncMock]
    ) -> None:
        router = LLMRouter()
        result = await router.generate("Explain in detail", complexity=0.6, user_tier="FREE")
        assert result.provider == "gemini"

    async def test_high_complexity_pro_routes_to_claude(
        self, smart_mode: None, patch_factory, mock_providers: dict[str, AsyncMock]
    ) -> None:
        router = LLMRouter()
        result = await router.generate("Deep analysis", complexity=0.9, user_tier="PRO")
        assert result.provider == "claude"

    async def test_fallback_on_provider_failure(
        self, smart_mode: None, patch_factory, mock_providers: dict[str, AsyncMock]
    ) -> None:
        mock_providers["deepseek"].generate.side_effect = Exception("DeepSeek down")
        router = LLMRouter()
        result = await router.generate("Test query", complexity=0.2, user_tier="FREE")
        assert result.provider == "gemini"
        mock_providers["gemini"].generate.assert_awaited_once()

    async def test_all_providers_fail_raises(
        self, smart_mode: None, patch_factory, mock_providers: dict[str, AsyncMock]
    ) -> None:
        for provider in mock_providers.values():
            provider.generate.side_effect = Exception("Provider down")
        router = LLMRouter()
        with pytest.raises(RuntimeError, match="All LLM providers failed"):
            await router.generate("Test query", complexity=0.2, user_tier="FREE")
