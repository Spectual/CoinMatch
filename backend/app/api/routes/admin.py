from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.services.ingest import fetch_museum_coins, fetch_online_coins, upsert_museum_coins, upsert_online_coins
from app.services.matcher import generate_matches


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/sync")
def sync_sources(db: Session = Depends(get_db), _: object = Depends(get_current_user)):
    museum_data = fetch_museum_coins()
    online_data = fetch_online_coins()
    museum_count = upsert_museum_coins(db, museum_data)
    online_count = upsert_online_coins(db, online_data)
    return {"museum_updated": museum_count, "online_updated": online_count}


@router.post("/match")
def run_matching(db: Session = Depends(get_db), _: object = Depends(get_current_user)):
    updated = generate_matches(db)
    return {"matches_updated": updated}

