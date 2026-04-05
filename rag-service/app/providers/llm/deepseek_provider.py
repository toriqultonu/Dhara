"""DeepSeek LLM provider — uses OpenAI-compatible API."""

import httpx
from app.providers.base import LLMResponse
from app.config import settings


class DeepSeekLLMProvider:
    PRICING = {
        "deepseek-chat": {"input": 0.14, "output": 0.28},
        "deepseek-reasoner": {"input": 0.55, "output": 2.19},
    }

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self._api_key = api_key or settings.deepseek_api_key
        self._model = model or settings.deepseek_model
        self._client = httpx.AsyncClient(
            base_url=settings.deepseek_base_url,
            headers={"Authorization": f"Bearer {self._api_key}"},
            timeout=60.0,
        )

    @property
    def provider_name(self) -> str:
        return "deepseek"

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

        response = await self._client.post("/v1/chat/completions", json={
            "model": self._model, "messages": messages,
            "temperature": temperature, "max_tokens": max_tokens,
        })
        response.raise_for_status()
        data = response.json()

        usage = data.get("usage", {})
        input_tokens = usage.get("prompt_tokens", 0)
        output_tokens = usage.get("completion_tokens", 0)
        pricing = self.PRICING.get(self._model, {"input": 0.14, "output": 0.28})
        cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000

        return LLMResponse(
            text=data["choices"][0]["message"]["content"], model=self._model,
            provider="deepseek", input_tokens=input_tokens,
            output_tokens=output_tokens, cost_usd=cost,
        )

    async def health_check(self) -> bool:
        try:
            resp = await self._client.get("/v1/models")
            return resp.status_code == 200
        except Exception:
            return False
