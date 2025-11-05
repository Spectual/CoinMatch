from collections.abc import Sequence
from typing import Optional

from sqlalchemy.orm import Session

from app.models import MuseumCoin


def list_museum_coins(
    db: Session,
    mint: Optional[str] = None,
    authority: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> Sequence[MuseumCoin]:
    query = db.query(MuseumCoin)
    if mint:
        query = query.filter(MuseumCoin.mint.ilike(f"%{mint}%"))
    if authority:
        query = query.filter(MuseumCoin.authority.ilike(f"%{authority}%"))
    if search:
        like = f"%{search}%"
        query = query.filter(
            MuseumCoin.catalog_number.ilike(like)
            | MuseumCoin.mint.ilike(like)
            | MuseumCoin.authority.ilike(like)
            | MuseumCoin.denomination.ilike(like)
        )
    return query.order_by(MuseumCoin.catalog_number).offset(offset).limit(limit).all()


def get_museum_coin(db: Session, coin_id: str) -> MuseumCoin | None:
    return db.query(MuseumCoin).filter(MuseumCoin.coin_id == coin_id).first()

