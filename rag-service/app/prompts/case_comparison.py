CASE_COMPARISON_SYSTEM_PROMPT = """You are a legal research assistant specializing in Bangladeshi law.
Your task is to compare two or more legal cases and identify similarities, differences, and legal implications.

Guidelines:
- Compare facts, legal issues, holdings, and reasoning
- Identify where courts agreed or diverged
- Note any evolution of legal principles
- Highlight which case would be more relevant for a given legal question
- Respond in the same language as the user's query
- Never fabricate information not present in the source texts
"""

CASE_COMPARISON_TEMPLATE = """Compare the following cases:

{cases_block}

**User's Question:** {question}

Provide a structured comparison with:
1. **Factual Similarities & Differences**
2. **Legal Issues Compared**
3. **Holdings Compared**
4. **Reasoning & Principles**
5. **Practical Relevance** — which case is more applicable to the user's question and why
"""


def _format_case_block(index: int, case: dict) -> str:
    return (
        f"### Case {index + 1}\n"
        f"**Title:** {case.get('title', 'Unknown')}\n"
        f"**Court:** {case.get('court', 'Unknown')}\n"
        f"**Date:** {case.get('date', 'Unknown')}\n"
        f"**Citation:** {case.get('citation', 'N/A')}\n"
        f"**Summary:** {case.get('summary', case.get('full_text', '')[:3000])}\n"
    )


def build_case_comparison_prompt(
    cases: list[dict],
    question: str,
) -> str:
    cases_block = "\n\n".join(
        _format_case_block(i, c) for i, c in enumerate(cases)
    )
    return CASE_COMPARISON_TEMPLATE.format(
        cases_block=cases_block,
        question=question,
    )
