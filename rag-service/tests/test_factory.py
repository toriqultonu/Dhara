"""Tests for provider factories."""

import pytest
from unittest.mock import patch, MagicMock

from app.providers.llm.factory import create_llm_provider
from app.providers.embedding.factory import create_embedding_provider
from app.providers.reranker.factory import create_reranker_provider


class TestLLMProviderFactory:
    def test_create_ollama_provider(self) -> None:
        with patch("app.providers.llm.factory.OllamaLLMProvider") as mock_cls:
            mock_cls.return_value = MagicMock()
            provider = create_llm_provider(
                provider_type="ollama",
                model="deepseek-r1:8b",
                base_url="http://localhost:11434",
            )
            mock_cls.assert_called_once()
            assert provider is not None

    def test_create_deepseek_provider(self) -> None:
        with patch("app.providers.llm.factory.DeepSeekLLMProvider") as mock_cls:
            mock_cls.return_value = MagicMock()
            provider = create_llm_provider(
                provider_type="deepseek",
                model="deepseek-chat",
                api_key="test-key",
            )
            mock_cls.assert_called_once()
            assert provider is not None

    def test_create_gemini_provider(self) -> None:
        with patch("app.providers.llm.factory.GeminiLLMProvider") as mock_cls:
            mock_cls.return_value = MagicMock()
            provider = create_llm_provider(
                provider_type="gemini",
                model="gemini-2.0-flash",
                api_key="test-key",
            )
            mock_cls.assert_called_once()
            assert provider is not None

    def test_create_claude_provider(self) -> None:
        with patch("app.providers.llm.factory.ClaudeLLMProvider") as mock_cls:
            mock_cls.return_value = MagicMock()
            provider = create_llm_provider(
                provider_type="claude",
                model="claude-sonnet-4-20250514",
                api_key="test-key",
            )
            mock_cls.assert_called_once()
            assert provider is not None

    def test_create_openai_provider(self) -> None:
        with patch("app.providers.llm.factory.OpenAILLMProvider") as mock_cls:
            mock_cls.return_value = MagicMock()
            provider = create_llm_provider(
                provider_type="openai",
                model="gpt-4o-mini",
                api_key="test-key",
            )
            mock_cls.assert_called_once()
            assert provider is not None

    def test_unknown_provider_raises(self) -> None:
        with pytest.raises(ValueError, match="Unknown LLM provider"):
            create_llm_provider(provider_type="unknown", model="test")


class TestEmbeddingProviderFactory:
    def test_create_bgem3_provider(self) -> None:
        with patch("app.providers.embedding.factory.BGEM3EmbeddingProvider") as mock_cls:
            mock_cls.return_value = MagicMock()
            provider = create_embedding_provider(
                provider_type="bgem3",
                model="BAAI/bge-m3",
            )
            mock_cls.assert_called_once()
            assert provider is not None

    def test_create_ollama_embedding_provider(self) -> None:
        with patch("app.providers.embedding.factory.OllamaEmbeddingProvider") as mock_cls:
            mock_cls.return_value = MagicMock()
            provider = create_embedding_provider(
                provider_type="ollama",
                model="nomic-embed-text",
                base_url="http://localhost:11434",
            )
            mock_cls.assert_called_once()
            assert provider is not None

    def test_unknown_embedding_provider_raises(self) -> None:
        with pytest.raises(ValueError, match="Unknown embedding provider"):
            create_embedding_provider(provider_type="unknown", model="test")


class TestRerankerProviderFactory:
    def test_create_bge_reranker(self) -> None:
        with patch("app.providers.reranker.factory.BGERerankerProvider") as mock_cls:
            mock_cls.return_value = MagicMock()
            provider = create_reranker_provider(
                provider_type="bge",
                model="BAAI/bge-reranker-v2-m3",
            )
            mock_cls.assert_called_once()
            assert provider is not None

    def test_create_noop_reranker(self) -> None:
        with patch("app.providers.reranker.factory.NoopRerankerProvider") as mock_cls:
            mock_cls.return_value = MagicMock()
            provider = create_reranker_provider(provider_type="noop")
            mock_cls.assert_called_once()
            assert provider is not None

    def test_unknown_reranker_provider_raises(self) -> None:
        with pytest.raises(ValueError, match="Unknown reranker provider"):
            create_reranker_provider(provider_type="unknown")
