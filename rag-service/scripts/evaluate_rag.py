"""RAG quality evaluation script.

Runs a set of test questions (Bengali + English) through the RAG pipeline
and evaluates answer quality based on citation accuracy and relevance.

Usage:
    uv run python scripts/evaluate_rag.py
"""

import asyncio
import json
import logging
import time
from dataclasses import dataclass

import httpx

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

RAG_SERVICE_URL = "http://localhost:8000"

TEST_QUESTIONS: list[dict[str, str]] = [
    # Bengali questions
    {"q": "দণ্ডবিধির ধারা ৩০২ কী?", "lang": "bn", "expected_type": "statute"},
    {"q": "হত্যার শাস্তি কত বছর?", "lang": "bn", "expected_type": "statute"},
    {"q": "জামিনের আইন কী বলে?", "lang": "bn", "expected_type": "statute"},
    {"q": "সুপ্রিম কোর্টের এখতিয়ার কী?", "lang": "bn", "expected_type": "statute"},
    {"q": "তালাকের আইনি প্রক্রিয়া কী?", "lang": "bn", "expected_type": "statute"},
    {"q": "ভূমি অধিগ্রহণ আইন ব্যাখ্যা করুন", "lang": "bn", "expected_type": "statute"},
    {"q": "মুসলিম পারিবারিক আইন অধ্যাদেশ কী?", "lang": "bn", "expected_type": "statute"},
    {"q": "ফৌজদারি কার্যবিধির ধারা ১৫৪ কী?", "lang": "bn", "expected_type": "statute"},
    {"q": "সাইবার অপরাধের শাস্তি কী?", "lang": "bn", "expected_type": "statute"},
    {"q": "শ্রম আইনে ছুটির বিধান কী?", "lang": "bn", "expected_type": "statute"},
    # English questions
    {"q": "What is Section 302 of the Penal Code?", "lang": "en", "expected_type": "statute"},
    {"q": "Explain the law on bail in Bangladesh", "lang": "en", "expected_type": "statute"},
    {"q": "What are the grounds for divorce?", "lang": "en", "expected_type": "statute"},
    {"q": "Explain the Digital Security Act", "lang": "en", "expected_type": "statute"},
    {"q": "What is the punishment for fraud?", "lang": "en", "expected_type": "statute"},
    {"q": "Explain writ jurisdiction in Bangladesh", "lang": "en", "expected_type": "statute"},
    {"q": "What is the Companies Act?", "lang": "en", "expected_type": "statute"},
    {"q": "Land registration process in Bangladesh", "lang": "en", "expected_type": "statute"},
    {"q": "What are consumer protection laws?", "lang": "en", "expected_type": "statute"},
    {"q": "Explain the Evidence Act", "lang": "en", "expected_type": "statute"},
    # Mixed / complex
    {"q": "Compare Section 299 and 300 of the Penal Code", "lang": "en", "expected_type": "statute"},
    {"q": "ধারা ২৯৯ এবং ৩০০ এর পার্থক্য কী?", "lang": "bn", "expected_type": "statute"},
    {"q": "Recent Supreme Court judgment on digital rights", "lang": "en", "expected_type": "judgment"},
    {"q": "সাম্প্রতিক হাইকোর্টের জামিন সংক্রান্ত রায়", "lang": "bn", "expected_type": "judgment"},
    {"q": "What SROs were issued for tax exemption?", "lang": "en", "expected_type": "sro"},
]


@dataclass
class EvalResult:
    question: str
    language: str
    has_answer: bool
    has_citations: bool
    citation_count: int
    latency_ms: float
    error: str | None = None


async def evaluate_question(client: httpx.AsyncClient, q: dict) -> EvalResult:
    start = time.time()
    try:
        resp = await client.post(
            f"{RAG_SERVICE_URL}/ask",
            json={"question": q["q"], "language": q["lang"]},
            timeout=30.0,
        )
        latency = (time.time() - start) * 1000
        if resp.status_code != 200:
            return EvalResult(
                question=q["q"],
                language=q["lang"],
                has_answer=False,
                has_citations=False,
                citation_count=0,
                latency_ms=latency,
                error=f"HTTP {resp.status_code}",
            )
        data = resp.json()
        answer = data.get("data", {}).get("answer", "")
        citations = data.get("data", {}).get("citations", [])
        return EvalResult(
            question=q["q"],
            language=q["lang"],
            has_answer=bool(answer and len(answer) > 20),
            has_citations=len(citations) > 0,
            citation_count=len(citations),
            latency_ms=latency,
        )
    except Exception as e:
        latency = (time.time() - start) * 1000
        return EvalResult(
            question=q["q"],
            language=q["lang"],
            has_answer=False,
            has_citations=False,
            citation_count=0,
            latency_ms=latency,
            error=str(e),
        )


async def main() -> None:
    results: list[EvalResult] = []

    async with httpx.AsyncClient() as client:
        for q in TEST_QUESTIONS:
            logger.info("Testing: %s", q["q"][:50])
            result = await evaluate_question(client, q)
            results.append(result)
            status = "PASS" if result.has_answer else "FAIL"
            logger.info("  %s (%.0fms, %d citations)", status, result.latency_ms, result.citation_count)

    # Summary
    total = len(results)
    answered = sum(1 for r in results if r.has_answer)
    cited = sum(1 for r in results if r.has_citations)
    errors = sum(1 for r in results if r.error)
    avg_latency = sum(r.latency_ms for r in results) / total if total else 0

    print("\n" + "=" * 60)
    print("RAG EVALUATION SUMMARY")
    print("=" * 60)
    print(f"Total questions:    {total}")
    print(f"Answered:           {answered}/{total} ({answered/total*100:.0f}%)")
    print(f"With citations:     {cited}/{total} ({cited/total*100:.0f}%)")
    print(f"Errors:             {errors}/{total}")
    print(f"Avg latency:        {avg_latency:.0f}ms")
    print("=" * 60)

    # Save detailed results
    output = [
        {
            "question": r.question,
            "language": r.language,
            "has_answer": r.has_answer,
            "has_citations": r.has_citations,
            "citation_count": r.citation_count,
            "latency_ms": round(r.latency_ms, 1),
            "error": r.error,
        }
        for r in results
    ]
    with open("eval_results.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    logger.info("Detailed results saved to eval_results.json")


if __name__ == "__main__":
    asyncio.run(main())
