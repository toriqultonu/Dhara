"""OpenAI-compatible LLM provider."""

from openai import AsyncOpenAI
from app.providers.base import LLMResponse
from app.config import settings


class OpenAILLMProvider:
    PRICING = {
        "gpt-4o-mini": {"input": 0.15, "output": 0.60},
        "gpt-4o": {"input": 2.50, "output": 10.00},
    }

    def __init__(self, api_key: str | None = None, model: str | None = None, base_url: str | None = None):
        self._model = model or settings.openai_model
        self._client = AsyncOpenAI(
            api_key=api_key or settings.openai_api_key,
            base_url=base_url or settings.openai_base_url,
        )

    @property
    def provider_name(self) -> str:
        return "openai"

    @property
    def model_name(self) -> str:
        return self._model

    async def generate(
        self, prompt: str, system_prompt: str | None = None,
        temperature: float = 0.1, max_tokens: int = 2048,
    ) -> LLMResponse:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self._client.chat.completions.create(
            model=self._model, messages=messages,
            temperature=temperature, max_tokens=max_tokens,
        )

        usage = response.usage
        input_tokens = usage.prompt_tokens if usage else 0
        output_tokens = usage.completion_tokens if usage else 0
        pricing = self.PRICING.get(self._model, {"input": 0.50, "output": 1.50})
        cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000

        return LLMResponse(
            text=response.choices[0].message.content or "", model=self._model,
            provider="openai", input_tokens=input_tokens,
            output_tokens=output_tokens, cost_usd=cost,
        )

    async def health_check(self) -> bool:
        try:
            await self._client.models.list()
            return True
        except Exception:
            return False
