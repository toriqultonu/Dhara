"""Ask router — full RAG Q&A endpoint."""

from fastapi import APIRouter, Request
from app.models.ask import AskRequest, AskResponse

router = APIRouter()


@router.post("", response_model=AskResponse)
async def ask(request: Request, body: AskRequest) -> AskResponse:
    rag_pipeline = request.app.state.rag_pipeline
    result = await rag_pipeline.ask(
        question=body.question, language=body.language, user_tier=body.user_tier,
    )
    return AskResponse(
        answer=result.answer, citations=result.citations,
        llm_provider=result.llm_provider, llm_model=result.llm_model,
        tokens_used=result.tokens_used, cost_usd=result.cost_usd,
    )
