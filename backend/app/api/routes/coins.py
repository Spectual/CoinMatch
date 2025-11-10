import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import MuseumCoin, OnlineCoin
from app.services.coins import (
    get_museum_coin,
    list_museum_coins,
    upsert_museum_coin,
    upsert_online_coin
)


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
        "source_type": coin.source_type,
    }
    return data


def serialize_online_coin(coin: OnlineCoin) -> dict:
    metadata = {
        "coin_id": coin.id,
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
        "created_at": coin.fetched_at.isoformat(),
        "updated_at": coin.fetched_at.isoformat(),
        "source_type": "online",
    }
    return {
        "id": coin.id,
        "museumCoinId": coin.museum_coin_id,
        "similarityScore": coin.similarity_score,
        "listingReference": coin.listing_reference,
        "saleDate": coin.sale_date,
        "estimate_value": coin.estimate_value,
        "sale_price": coin.sale_price,
        "listing_url": coin.listing_url,
        "metadata": metadata,
        "fetchedAt": coin.fetched_at.isoformat(),
        "sourceName": coin.source_name,
        "mint": coin.mint,
        "authority": coin.authority,
        "denomination": coin.denomination,
        "metal": coin.metal,
    }


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


@router.get("/online-coins")
def list_online_coins(
    mint: Optional[str] = Query(default=None),
    denomination: Optional[str] = Query(default=None),
    metal: Optional[str] = Query(default=None),
    limit: int = Query(default=100, le=200),
    offset: int = Query(default=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(OnlineCoin)
    if mint:
        query = query.filter(OnlineCoin.mint.ilike(f'%{mint}%'))
    if denomination:
        query = query.filter(OnlineCoin.denomination.ilike(f'%{denomination}%'))
    if metal:
        query = query.filter(OnlineCoin.metal.ilike(f'%{metal}%'))
    coins = query.order_by(OnlineCoin.fetched_at.desc()).offset(offset).limit(limit).all()
    return [serialize_online_coin(coin) for coin in coins]


@router.post("/museum-coins")
def create_museum_coins(
    payload: dict | list[dict],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    data = payload if isinstance(payload, list) else [payload]
    created = []
    for item in data:
        try:
            coin = upsert_museum_coin(db, item)
            created.append(serialize_coin(coin))
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"items": created, "count": len(created)}


@router.post("/online-coins")
def create_online_coins(
    payload: dict | list[dict],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    data = payload if isinstance(payload, list) else [payload]
    created = []
    for item in data:
        try:
            coin = upsert_online_coin(db, item)
            created.append(serialize_online_coin(coin))
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"items": created, "count": len(created)}

