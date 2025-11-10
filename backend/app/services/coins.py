import json
from collections.abc import Sequence
from typing import Optional

from sqlalchemy.orm import Session

from app.models import MuseumCoin, OnlineCoin
from datetime import datetime


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


def upsert_museum_coin(db: Session, payload: dict) -> MuseumCoin:
    coin_id = str(payload.get("coin_id") or payload.get("id") or "")
    if not coin_id:
        raise ValueError("coin_id is required")
    coin = get_museum_coin(db, coin_id)
    if not coin:
        coin = MuseumCoin(coin_id=coin_id)
        db.add(coin)
    coin.mint = payload.get("mint") or coin.mint or ""
    coin.authority = payload.get("authority") or coin.authority or ""
    coin.date_range = payload.get("date_range") or coin.date_range or ""
    coin.denomination = payload.get("denomination") or coin.denomination or ""
    coin.metal = payload.get("metal") or coin.metal or ""
    coin.weight = payload.get("weight")
    coin.diameter = payload.get("diameter")
    coin.die_axis = payload.get("die_axis")
    coin.obverse_description = payload.get("obverse_description") or coin.obverse_description or ""
    coin.reverse_description = payload.get("reverse_description") or coin.reverse_description or ""
    coin.obverse_inscription = payload.get("obverse_inscription")
    coin.reverse_inscription = payload.get("reverse_inscription")
    coin.monograms = payload.get("monograms")
    coin.reference_list = payload.get("reference_list")
    coin.catalog_number = payload.get("catalog_number")
    coin.source_database = payload.get("source_database")
    coin.provenance_text = payload.get("provenance_text")
    coin.previous_owners = payload.get("previous_owners")
    if isinstance(payload.get("auction_history"), list):
        coin.auction_history = json.dumps(payload.get("auction_history"))
    coin.estimate_value = payload.get("estimate_value")
    coin.sale_price = payload.get("sale_price")
    coin.obverse_image_key = payload.get("obverse_image_key") or payload.get("obverse_image_url")
    coin.reverse_image_key = payload.get("reverse_image_key") or payload.get("reverse_image_url")
    coin.lot_description_raw = payload.get("lot_description_raw")
    coin.lot_description_en = payload.get("lot_description_EN") or payload.get("lot_description_en")
    coin.source_type = "museum"
    if not coin.created_at:
        coin.created_at = datetime.utcnow()
    coin.updated_at = datetime.utcnow()
    return coin


def upsert_online_coin(db: Session, payload: dict) -> OnlineCoin:
    coin_id = str(payload.get("coin_id") or payload.get("id") or "")
    if not coin_id:
        raise ValueError("coin_id is required")
    coin = db.query(OnlineCoin).filter(OnlineCoin.id == coin_id).first()
    if not coin:
        coin = OnlineCoin(id=coin_id)
        db.add(coin)
    coin.museum_coin_id = payload.get("museum_coin_id")
    coin.similarity_score = float(payload.get("similarity_score") or payload.get("score") or coin.similarity_score or 0.0)
    coin.listing_reference = payload.get("listing_reference") or payload.get("title") or coin_id
    coin.sale_date = payload.get("sale_date")
    coin.estimate_value = payload.get("estimate_value")
    coin.sale_price = payload.get("sale_price")
    coin.listing_url = payload.get("listing_url")
    coin.metadata_json = json.dumps(payload)
    coin.mint = payload.get("mint")
    coin.authority = payload.get("authority")
    coin.date_range = payload.get("date_range")
    coin.denomination = payload.get("denomination")
    coin.metal = payload.get("metal")
    coin.weight = payload.get("weight")
    coin.diameter = payload.get("diameter")
    coin.die_axis = payload.get("die_axis")
    coin.obverse_description = payload.get("obverse_description")
    coin.reverse_description = payload.get("reverse_description")
    coin.obverse_inscription = payload.get("obverse_inscription")
    coin.reverse_inscription = payload.get("reverse_inscription")
    coin.monograms = payload.get("monograms")
    coin.reference_list = payload.get("reference_list")
    coin.catalog_number = payload.get("catalog_number")
    coin.source_database = payload.get("source_database")
    coin.provenance_text = payload.get("provenance_text")
    coin.previous_owners = payload.get("previous_owners")
    if isinstance(payload.get("auction_history"), list):
        coin.auction_history = json.dumps(payload.get("auction_history"))
    coin.obverse_image_key = payload.get("obverse_image_key") or payload.get("obverse_image_url")
    coin.reverse_image_key = payload.get("reverse_image_key") or payload.get("reverse_image_url")
    coin.lot_description_raw = payload.get("lot_description_raw")
    coin.lot_description_en = payload.get("lot_description_EN") or payload.get("lot_description_en")
    coin.source_name = payload.get("source_name")
    coin.fetched_at = datetime.utcnow()
    return coin

