from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable, List, Mapping, Sequence

import requests
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import MuseumCoin, OnlineCoin
from app.services.coins import upsert_museum_coin, upsert_online_coin


settings = get_settings()


@dataclass
class FetchedCoin:
    data: Mapping[str, object]
    source: str


def _load_remote_json(url: str) -> Sequence[Mapping[str, object]]:
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    payload = response.json()
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        records = payload.get("items") or payload.get("data")
        if isinstance(records, list):
            return records
    raise ValueError(f"Unsupported payload structure at {url}")


def fetch_museum_coins() -> List[FetchedCoin]:
    url = settings.museum_source_url
    if not url:
        return []
    records = _load_remote_json(url)
    return [FetchedCoin(data=record, source=url) for record in records]


def fetch_online_coins() -> List[FetchedCoin]:
    url = settings.online_source_url
    if not url:
        return []
    records = _load_remote_json(url)
    return [FetchedCoin(data=record, source=url) for record in records]


def upsert_museum_coins(session: Session, coins: Iterable[FetchedCoin]) -> int:
    count = 0
    for fetched in coins:
        payload = dict(fetched.data)
        coin_id = str(payload.get("coin_id") or payload.get("id") or "")
        if not coin_id:
            continue
        coin = upsert_museum_coin(session, payload)
        coin.updated_at = datetime.utcnow()
        count += 1
    return count


def upsert_online_coins(session: Session, coins: Iterable[FetchedCoin]) -> int:
    count = 0
    for fetched in coins:
        payload = dict(fetched.data)
        coin_id = str(payload.get("coin_id") or payload.get("id") or "")
        if not coin_id:
            continue
        payload.setdefault("source_name", fetched.source)
        upsert_online_coin(session, payload)
        count += 1
    return count

