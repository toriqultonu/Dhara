CASE_SUMMARY_SYSTEM_PROMPT = """You are a legal research assistant specializing in Bangladeshi law.
Your task is to generate concise, accurate case summaries from judgment texts.

Guidelines:
- Extract key facts, legal issues, holdings, and reasoning
- Identify the court, bench composition, and date
- List all statutes and prior cases cited
- Use clear, professional legal language
- If the text is in Bengali, respond in Bengali. If English, respond in English.
- Never fabricate information not present in the source text
"""

CASE_SUMMARY_TEMPLATE = """Summarize the following judgment:

**Case Title:** {case_title}
**Court:** {court}
**Date:** {date}
**Citation:** {citation}

**Full Text:**
{full_text}

Provide a structured summary with:
1. **Facts:** Brief statement of material facts
2. **Issues:** Legal questions before the court
3. **Held:** The court's decision/ruling
4. **Reasoning:** Key legal reasoning and principles applied
5. **Statutes Cited:** List of statutes referenced
6. **Cases Cited:** List of prior cases referenced
"""


def build_case_summary_prompt(
    case_title: str,
    court: str,
    date: str,
    citation: str,
    full_text: str,
) -> str:
    return CASE_SUMMARY_TEMPLATE.format(
        case_title=case_title,
        court=court,
        date=date,
        citation=citation,
        full_text=full_text[:8000],
    )
