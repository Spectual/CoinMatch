import json
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import SearchJob
from app.schemas import SearchJobStatusResponse, TextSearchRequest
from app.services.search import ensure_candidate_links, run_search


router = APIRouter(prefix="/api", tags=["search"])


def serialize_candidate(candidate) -> dict:
    metadata = {}
    if candidate.metadata_json:
        try:
            metadata = json.loads(candidate.metadata_json)
        except json.JSONDecodeError:
            metadata = {}
    return {
        "id": candidate.id,
        "museumCoinId": candidate.museum_coin_id,
        "similarityScore": candidate.similarity_score,
        "listingReference": candidate.listing_reference,
        "saleDate": candidate.sale_date,
        "estimate_value": candidate.estimate_value,
        "sale_price": candidate.sale_price,
        "listing_url": candidate.listing_url,
        "metadata": metadata
    }


@router.post("/search/image")
async def search_image(
    museum_coin_id: Optional[str] = Form(default=None),
    min_score: float = Form(default=0.0),
    obverse: UploadFile | None = File(default=None),
    reverse: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    job, results = run_search(db, "image", museum_coin_id, None, min_score=min_score, user_id=current_user.id)
    ensure_candidate_links(db, results)
    return [serialize_candidate(item) for item in results]


@router.post("/search/text")
def search_text(
    payload: TextSearchRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    job, results = run_search(
        db,
        "text",
        payload.museum_coin_id,
        payload.query,
        min_score=payload.min_score,
        user_id=current_user.id
    )
    ensure_candidate_links(db, results)
    return [serialize_candidate(item) for item in results]


@router.get("/search/jobs/{job_id}", response_model=SearchJobStatusResponse)
def get_job(job_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    job = db.query(SearchJob).filter(SearchJob.id == job_id).first()
    if not job:
        return SearchJobStatusResponse(job_id=job_id, status="unknown")
    return SearchJobStatusResponse(job_id=job.id, status=job.status, completed_at=job.completed_at, summary=job.result_summary)

