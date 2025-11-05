from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import CandidateListing, MuseumCoin, SearchJob


def run_search(
    db: Session,
    job_type: str,
    museum_coin_id: Optional[str],
    query_text: Optional[str],
    min_score: float = 0.0,
    user_id: Optional[int] = None
) -> tuple[SearchJob, Sequence[CandidateListing]]:
    job = SearchJob(
        job_type=job_type,
        museum_coin_id=museum_coin_id,
        query_text=query_text,
        status="completed",
        created_by=user_id,
        created_at=datetime.utcnow(),
        completed_at=datetime.utcnow(),
        result_summary="placeholder-results"
    )
    db.add(job)
    db.flush()

    query = db.query(CandidateListing)
    if museum_coin_id:
        query = query.filter(CandidateListing.museum_coin_id == museum_coin_id)
    if query_text:
        like = f"%{query_text}%"
        query = query.filter(
            func.lower(CandidateListing.metadata_json).like(func.lower(like))
            | CandidateListing.listing_reference.ilike(like)
        )
    results = query.filter(CandidateListing.similarity_score >= min_score).order_by(CandidateListing.similarity_score.desc()).limit(20).all()

    return job, results


def ensure_candidate_links(db: Session, candidates: Sequence[CandidateListing]) -> None:
    for candidate in candidates:
        if candidate.museum_coin_id:
            continue
        coin = db.query(MuseumCoin).first()
        if coin:
            candidate.museum_coin_id = coin.coin_id
            db.add(candidate)
    db.flush()

