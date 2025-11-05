from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import MatchRecord as MatchRecordModel
from app.schemas import MatchDecisionRequest
from app.services.matches import log_match_decision


router = APIRouter(prefix="/api", tags=["matches"])


def serialize_match(record: MatchRecordModel) -> dict:
    return {
        "id": record.id,
        "coinId": record.museum_coin_id,
        "candidateId": record.candidate_id,
        "similarityScore": record.similarity_score,
        "status": record.status,
        "savedAt": record.saved_at.isoformat(),
        "notes": record.notes,
        "source": record.source,
        "museumCoinTitle": record.museum_coin.catalog_number if record.museum_coin else None,
        "candidateTitle": record.candidate.listing_reference if record.candidate else None
    }


@router.post("/match/save")
def save_match(
    payload: MatchDecisionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    record = log_match_decision(
        db,
        museum_coin_id=payload.museum_coin_id,
        candidate_id=payload.candidate_id,
        decision=payload.decision,
        notes=payload.notes,
        user_id=current_user.id
    )
    return serialize_match(record)


@router.get("/match/history")
def match_history(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    coin_id: Optional[str] = Query(default=None),
    limit: int = Query(default=100, le=200),
    offset: int = Query(default=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    base_query = db.query(MatchRecordModel)
    if status_filter:
        base_query = base_query.filter(MatchRecordModel.status.ilike(f"%{status_filter}%"))
    if coin_id:
        base_query = base_query.filter(MatchRecordModel.museum_coin_id == coin_id)
    total = base_query.count()
    records = (
        base_query.order_by(MatchRecordModel.saved_at.desc()).offset(offset).limit(limit).all()
    )
    return {
        "items": [serialize_match(record) for record in records],
        "total": total
    }

