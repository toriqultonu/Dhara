"""Search router — hybrid vector + BM25 search endpoint."""

import time
from fastapi import APIRouter, Request
from app.models.search import SearchRequest, SearchResponse

router = APIRouter()


@router.post("", response_model=SearchResponse)
async def search(request: Request, body: SearchRequest) -> SearchResponse:
    start = time.perf_counter()
    search_service = request.app.state.search_service
    results = await search_service.hybrid_search(
        query_text=body.query, language=body.language,
        top_k=body.top_k, filters=body.filters,
    )
    elapsed = (time.perf_counter() - start) * 1000
    return SearchResponse(results=results, search_time_ms=round(elapsed, 2))
