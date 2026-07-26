"""Tests for provider factories."""

from unittest.mock import MagicMock, patch

import pytest

from app.providers.embedding.factory import create_embedding_provider
from app.providers.llm.factory import create_llm_provider
from app.providers.reranker.factory import create_reranker_provider


class TestLLMProviderFactory:
    @pytest.mark.parametrize(
        ("name", "target"),
        [
            ("ollama", "app.providers.llm.ollama_provider.OllamaLLMProvider"),
            ("deepseek", "app.providers.llm.deepseek_provider.DeepSeekLLMProvider"),
            ("gemini", "app.providers.llm.gemini_provider.GeminiLLMProvider"),
            ("claude", "app.providers.llm.claude_provider.ClaudeLLMProvider"),
            ("openai", "app.providers.llm.openai_provider.OpenAILLMProvider"),
        ],
    )
    def test_creates_provider_by_name(self, name: str, target: str) -> None:
        with patch(target) as mock_cls:
            mock_cls.return_value = MagicMock()
            provider = create_llm_provider(name)
            mock_cls.assert_called_once_with()
            assert provider is mock_cls.return_value

    def test_name_is_case_insensitive(self) -> None:
        with patch("app.providers.llm.ollama_provider.OllamaLLMProvider") as mock_cls:
            create_llm_provider("OLLAMA")
            mock_cls.assert_called_once_with()

    def test_unknown_provider_raises(self) -> None:
        with pytest.raises(ValueError, match="Unknown LLM provider"):
            create_llm_provider("unknown")


class TestEmbeddingProviderFactory:
    @pytest.mark.parametrize(
        ("name", "target"),
        [
            ("bgem3", "app.providers.embedding.bgem3_provider.BGEM3EmbeddingProvider"),
            ("ollama", "app.providers.embedding.ollama_provider.OllamaEmbeddingProvider"),
            ("openai", "app.providers.embedding.openai_provider.OpenAIEmbeddingProvider"),
        ],
    )
    def test_creates_provider_by_name(self, name: str, target: str) -> None:
        with patch(target) as mock_cls:
            mock_cls.return_value = MagicMock()
            provider = create_embedding_provider(name)
            mock_cls.assert_called_once_with()
            assert provider is mock_cls.return_value

    def test_unknown_embedding_provider_raises(self) -> None:
        with pytest.raises(ValueError, match="Unknown embedding provider"):
            create_embedding_provider("unknown")


class TestRerankerProviderFactory:
    @pytest.mark.parametrize(
        ("name", "target"),
        [
            ("bge", "app.providers.reranker.bge_reranker.BGERerankerProvider"),
            ("cohere", "app.providers.reranker.cohere_reranker.CohereRerankerProvider"),
            ("noop", "app.providers.reranker.noop_reranker.NoopRerankerProvider"),
        ],
    )
    def test_creates_provider_by_name(self, name: str, target: str) -> None:
        with patch(target) as mock_cls:
            mock_cls.return_value = MagicMock()
            provider = create_reranker_provider(name)
            mock_cls.assert_called_once_with()
            assert provider is mock_cls.return_value

    def test_unknown_reranker_provider_raises(self) -> None:
        with pytest.raises(ValueError, match="Unknown reranker provider"):
            create_reranker_provider("unknown")
