from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models import MatchRecord, MuseumCoin, OnlineCoin


def log_match_decision(
    db: Session,
    museum_coin_id: str,
    candidate_id: Optional[str],
    decision: str,
    notes: Optional[str],
    user_id: Optional[int]
) -> MatchRecord:
    museum_coin = db.query(MuseumCoin).filter(MuseumCoin.coin_id == museum_coin_id).first()
    if not museum_coin:
        raise ValueError("Museum coin not found")

    candidate = None
    if candidate_id:
        candidate = db.query(OnlineCoin).filter(OnlineCoin.id == candidate_id).first()
        if not candidate:
            raise ValueError("Candidate listing not found")

    similarity = candidate.similarity_score if candidate else 0.0
    source = candidate.listing_reference if candidate else None

    record = (
        db.query(MatchRecord)
        .filter(MatchRecord.museum_coin_id == museum_coin_id, MatchRecord.candidate_id == candidate_id)
        .first()
    )

    normalized = (decision or "").strip().lower()
    status_lookup = {
        "accept": "Accepted",
        "accepted": "Accepted",
        "approve": "Accepted",
        "reject": "Rejected",
        "rejected": "Rejected",
        "pending": "Pending",
        "save": "Pending",
        "save for later": "Pending",
        "hold": "Pending",
    }
    status_value = status_lookup.get(normalized, "Pending")

    if record:
        record.status = status_value
        record.notes = notes
        record.saved_at = datetime.utcnow()
        record.similarity_score = similarity
        record.source = source
        record.decided_by = user_id
    else:
        record = MatchRecord(
            museum_coin_id=museum_coin_id,
            candidate_id=candidate_id,
            similarity_score=similarity,
            status=status_value,
            notes=notes,
            source=source,
            saved_at=datetime.utcnow(),
            decided_by=user_id
        )
        db.add(record)

    db.flush()
    return record

