import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import MuseumCoin
from app.schemas import MuseumCoinBase
from app.services.coins import get_museum_coin, list_museum_coins


router = APIRouter(prefix="/api", tags=["coins"])


def serialize_coin(coin: MuseumCoin) -> dict:
    data = {
        "coin_id": coin.coin_id,
        "mint": coin.mint,
        "authority": coin.authority,
        "date_range": coin.date_range,
        "denomination": coin.denomination,
        "metal": coin.metal,
        "weight": coin.weight,
        "diameter": coin.diameter,
        "die_axis": coin.die_axis,
        "obverse_description": coin.obverse_description,
        "reverse_description": coin.reverse_description,
        "obverse_inscription": coin.obverse_inscription,
        "reverse_inscription": coin.reverse_inscription,
        "monograms": coin.monograms,
        "reference_list": coin.reference_list,
        "catalog_number": coin.catalog_number,
        "source_database": coin.source_database,
        "provenance_text": coin.provenance_text,
        "previous_owners": coin.previous_owners,
        "auction_history": json.loads(coin.auction_history) if coin.auction_history else [],
        "estimate_value": coin.estimate_value,
        "sale_price": coin.sale_price,
        "obverse_image_url": coin.obverse_image_key,
        "reverse_image_url": coin.reverse_image_key,
        "lot_description_raw": coin.lot_description_raw,
        "lot_description_EN": coin.lot_description_en,
        "created_at": coin.created_at.isoformat(),
        "updated_at": coin.updated_at.isoformat(),
        "source_type": coin.source_type
    }
    return data


@router.get("/museum-coins")
def list_coins(
    mint: Optional[str] = Query(default=None),
    authority: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    limit: int = Query(default=100, le=200),
    offset: int = Query(default=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    coins = list_museum_coins(db, mint=mint, authority=authority, search=search, limit=limit, offset=offset)
    return [serialize_coin(coin) for coin in coins]


@router.get("/museum-coins/{coin_id}")
def coin_detail(coin_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    coin = get_museum_coin(db, coin_id)
    if not coin:
        raise HTTPException(status_code=404, detail="Coin not found")
    return serialize_coin(coin)

