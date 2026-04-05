"""Google Gemini LLM provider."""

import google.generativeai as genai
from app.providers.base import LLMResponse
from app.config import settings


class GeminiLLMProvider:
    PRICING = {
        "gemini-2.5-flash": {"input": 0.15, "output": 0.60},
        "gemini-2.5-pro": {"input": 1.25, "output": 10.00},
    }

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self._model_name = model or settings.gemini_model
        genai.configure(api_key=api_key or settings.gemini_api_key)
        self._model = genai.GenerativeModel(self._model_name)

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def model_name(self) -> str:
        return self._model_name

    async def generate(
        self, prompt: str, system_prompt: str | None = None,
        temperature: float = 0.1, max_tokens: int = 2048,
    ) -> LLMResponse:
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        response = await self._model.generate_content_async(
            full_prompt,
            generation_config=genai.GenerationConfig(
                temperature=temperature, max_output_tokens=max_tokens,
            ),
        )

        input_tokens = response.usage_metadata.prompt_token_count
        output_tokens = response.usage_metadata.candidates_token_count
        pricing = self.PRICING.get(self._model_name, {"input": 0.30, "output": 1.20})
        cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000

        return LLMResponse(
            text=response.text, model=self._model_name, provider="gemini",
            input_tokens=input_tokens, output_tokens=output_tokens, cost_usd=cost,
        )

    async def health_check(self) -> bool:
        try:
            response = await self._model.generate_content_async("ping")
            return bool(response.text)
        except Exception:
            return False
