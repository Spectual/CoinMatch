from __future__ import annotations

from datetime import datetime
from typing import Iterable, List

from sqlalchemy.orm import Session

from app.models import MatchRecord, MuseumCoin, OnlineCoin


def _prefilter_candidates(session: Session, museum_coin: MuseumCoin) -> List[OnlineCoin]:
    query = session.query(OnlineCoin)
    if museum_coin.mint:
        query = query.filter(OnlineCoin.mint.ilike(f'%{museum_coin.mint}%'))
    if museum_coin.denomination:
        query = query.filter(OnlineCoin.denomination.ilike(f'%{museum_coin.denomination}%'))
    if museum_coin.metal:
        query = query.filter(OnlineCoin.metal.ilike(f'%{museum_coin.metal}%'))
    if museum_coin.authority:
        query = query.filter(OnlineCoin.authority.ilike(f'%{museum_coin.authority}%'))
    return query.order_by(OnlineCoin.fetched_at.desc()).limit(200).all()


def _compute_score(museum_coin: MuseumCoin, online_coin: OnlineCoin) -> float:
    overlap = 0.0
    if museum_coin.mint and online_coin.mint and museum_coin.mint.lower() == online_coin.mint.lower():
        overlap += 0.35
    if museum_coin.authority and online_coin.authority and museum_coin.authority.lower() == online_coin.authority.lower():
        overlap += 0.3
    if museum_coin.denomination and online_coin.denomination and museum_coin.denomination.lower() == online_coin.denomination.lower():
        overlap += 0.25
    if museum_coin.metal and online_coin.metal and museum_coin.metal.lower() == online_coin.metal.lower():
        overlap += 0.1
    score = min(max(overlap, 0.15), 0.99)
    return round(score, 4)


def generate_matches(session: Session, museum_coins: Iterable[MuseumCoin] | None = None) -> int:
    updated = 0
    coins = list(museum_coins) if museum_coins is not None else session.query(MuseumCoin).all()
    for coin in coins:
        candidates = _prefilter_candidates(session, coin)
        for candidate in candidates:
            existing = (
                session.query(MatchRecord)
                .filter(MatchRecord.museum_coin_id == coin.coin_id, MatchRecord.candidate_id == candidate.id)
                .first()
            )
            if existing and existing.status == "Accepted":
                continue
            score = _compute_score(coin, candidate)
            candidate.similarity_score = score
            if existing:
                existing.similarity_score = score
                existing.source = candidate.listing_reference
                existing.saved_at = datetime.utcnow()
                updated += 1
            else:
                match = MatchRecord(
                    museum_coin_id=coin.coin_id,
                    candidate_id=candidate.id,
                    similarity_score=score,
                    status="Pending",
                    source=candidate.listing_reference,
                    saved_at=datetime.utcnow(),
                )
                session.add(match)
                updated += 1
    return updated

