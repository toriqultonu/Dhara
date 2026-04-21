"""Ask router — full RAG Q&A endpoint (supports rag / document / statute modes)."""

from fastapi import APIRouter, HTTPException, Request
from app.models.ask import AskRequest, AskResponse

router = APIRouter()


@router.post("", response_model=AskResponse)
async def ask(request: Request, body: AskRequest) -> AskResponse:
    rag_pipeline = request.app.state.rag_pipeline

    if body.mode == "document":
        if not body.document_text:
            raise HTTPException(status_code=400, detail="document_text required for document mode")
        result = await rag_pipeline.ask_with_document_context(
            question=body.question, document_text=body.document_text,
            language=body.language, user_tier=body.user_tier,
        )
    elif body.mode == "statute":
        if not body.statute_id:
            raise HTTPException(status_code=400, detail="statute_id required for statute mode")
        result = await rag_pipeline.ask(
            question=body.question, language=body.language,
            user_tier=body.user_tier, statute_id=body.statute_id,
        )
    else:
        result = await rag_pipeline.ask(
            question=body.question, language=body.language, user_tier=body.user_tier,
        )

    return AskResponse(
        answer=result.answer, citations=result.citations,
        llm_provider=result.llm_provider, llm_model=result.llm_model,
        tokens_used=result.tokens_used, cost_usd=result.cost_usd,
    )
