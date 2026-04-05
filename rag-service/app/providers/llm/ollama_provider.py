"""Ollama LLM provider — works with ANY model available in Ollama."""

import httpx
from app.providers.base import LLMResponse
from app.config import settings


class OllamaLLMProvider:
    def __init__(self, base_url: str | None = None, model: str | None = None):
        self._base_url = base_url or settings.ollama_base_url
        self._model = model or settings.ollama_model
        self._client = httpx.AsyncClient(base_url=self._base_url, timeout=120.0)

    @property
    def provider_name(self) -> str:
        return "ollama"

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

        response = await self._client.post("/api/chat", json={
            "model": self._model, "messages": messages, "stream": False,
            "options": {"temperature": temperature, "num_predict": max_tokens},
        })
        response.raise_for_status()
        data = response.json()

        return LLMResponse(
            text=data["message"]["content"], model=self._model, provider="ollama",
            input_tokens=data.get("prompt_eval_count", 0),
            output_tokens=data.get("eval_count", 0), cost_usd=0.0,
        )

    async def health_check(self) -> bool:
        try:
            resp = await self._client.get("/api/tags")
            return resp.status_code == 200
        except Exception:
            return False
