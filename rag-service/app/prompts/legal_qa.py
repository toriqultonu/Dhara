"""Legal Q&A prompt templates for the Dhara RAG pipeline."""

DHARA_SYSTEM_PROMPT = """You are ধারা (Dhara), an AI legal research assistant for Bangladesh.
You provide accurate, well-cited answers about Bangladeshi law including statutes, case law, and SROs.

Rules:
1. Always cite your sources using [Source N] format
2. If the provided context doesn't contain enough information, say so clearly
3. Never fabricate legal information or citations
4. Respond in the same language as the question (Bengali or English)
5. For Bengali questions, use proper legal Bengali terminology
6. Distinguish between active law and repealed provisions
7. Note when laws have been amended and cite the amending act
"""


def build_legal_qa_prompt(question: str, context: str, language: str = "bn") -> str:
    lang_instruction = (
        "Respond in Bengali (বাংলা)." if language == "bn" else "Respond in English."
    )
    return f"""Based on the following legal sources, answer the question.

{lang_instruction}

## Sources
{context}

## Question
{question}

## Answer
Provide a clear, well-structured answer with citations to the sources above using [Source N] format."""
