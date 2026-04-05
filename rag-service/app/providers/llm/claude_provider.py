"""Anthropic Claude LLM provider."""

import anthropic
from app.providers.base import LLMResponse
from app.config import settings


class ClaudeLLMProvider:
    PRICING = {
        "claude-sonnet-4-20250514": {"input": 3.0, "output": 15.0},
        "claude-haiku-4-5-20251001": {"input": 0.80, "output": 4.0},
    }

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self._model = model or settings.claude_model
        self._client = anthropic.AsyncAnthropic(api_key=api_key or settings.anthropic_api_key)

    @property
    def provider_name(self) -> str:
        return "claude"

    @property
    def model_name(self) -> str:
        return self._model

    async def generate(
        self, prompt: str, system_prompt: str | None = None,
        temperature: float = 0.1, max_tokens: int = 2048,
    ) -> LLMResponse:
        kwargs: dict = {
            "model": self._model, "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_prompt:
            kwargs["system"] = system_prompt

        response = await self._client.messages.create(**kwargs)
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
        pricing = self.PRICING.get(self._model, {"input": 3.0, "output": 15.0})
        cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000

        return LLMResponse(
            text=response.content[0].text, model=self._model, provider="claude",
            input_tokens=input_tokens, output_tokens=output_tokens, cost_usd=cost,
        )

    async def health_check(self) -> bool:
        try:
            await self._client.messages.create(
                model=self._model, max_tokens=10,
                messages=[{"role": "user", "content": "ping"}],
            )
            return True
        except Exception:
            return False
