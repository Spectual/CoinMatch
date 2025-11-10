from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class UserLoginRequest(BaseModel):
    email: str
    password: str


class UserLoginResponse(BaseModel):
    token: str
    user: "UserProfile"


class UserProfile(BaseModel):
    name: str
    email: str
    role: str = "curator"


class MuseumCoinBase(BaseModel):
    coin_id: str
    mint: str
    authority: str
    date_range: str
    denomination: str
    metal: str
    weight: Optional[float] = None
    diameter: Optional[float] = None
    die_axis: Optional[str] = None
    obverse_description: str
    reverse_description: str
    obverse_inscription: Optional[str] = None
    reverse_inscription: Optional[str] = None
    monograms: Optional[str] = None
    reference_list: Optional[str] = None
    catalog_number: Optional[str] = None
    source_database: Optional[str] = None
    provenance_text: Optional[str] = None
    previous_owners: Optional[str] = None
    auction_history: Optional[str] = None
    estimate_value: Optional[str] = None
    sale_price: Optional[str] = None
    obverse_image_key: Optional[str] = None
    reverse_image_key: Optional[str] = None
    lot_description_raw: Optional[str] = None
    lot_description_en: Optional[str] = Field(None, alias="lot_description_EN")
    created_at: datetime
    updated_at: datetime
    source_type: str

    class Config:
        populate_by_name = True


class CandidateListing(BaseModel):
    id: str
    museumCoinId: Optional[str] = Field(None, alias="museum_coin_id")
    similarityScore: float = Field(alias="similarity_score")
    listingReference: str = Field(alias="listing_reference")
    saleDate: Optional[str] = Field(None, alias="sale_date")
    estimate_value: Optional[str] = None
    sale_price: Optional[str] = None
    listing_url: Optional[str] = None
    sourceName: Optional[str] = Field(None, alias="source_name")

    class Config:
        populate_by_name = True


class MatchRecord(BaseModel):
    id: int
    coinId: str
    candidateId: Optional[str]
    similarityScore: float
    status: str
    savedAt: datetime
    notes: Optional[str]
    source: Optional[str]


class MatchDecisionRequest(BaseModel):
    museum_coin_id: str
    candidate_id: Optional[str]
    decision: str
    notes: Optional[str] = None


class SearchJobResponse(BaseModel):
    job_id: str
    status: str
    summary: Optional[str] = None


class SearchJobStatusResponse(BaseModel):
    job_id: str
    status: str
    completed_at: Optional[datetime] = None
    summary: Optional[str] = None


class TextSearchRequest(BaseModel):
    query: str
    museum_coin_id: Optional[str] = None
    min_score: float = 0.0


UserLoginResponse.model_rebuild()

