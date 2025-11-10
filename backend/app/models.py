import uuid
from datetime import datetime, timedelta

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tokens: Mapped[list["SessionToken"]] = relationship("SessionToken", back_populates="user", cascade="all, delete-orphan")
    matches: Mapped[list["MatchRecord"]] = relationship("MatchRecord", back_populates="decided_by_user")


class SessionToken(Base):
    __tablename__ = "session_tokens"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: uuid.uuid4().hex)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=7))

    user: Mapped[User] = relationship("User", back_populates="tokens")


class MuseumCoin(Base):
    __tablename__ = "museum_coins"

    coin_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    mint: Mapped[str] = mapped_column(String(255))
    authority: Mapped[str] = mapped_column(String(255))
    date_range: Mapped[str] = mapped_column(String(255))
    denomination: Mapped[str] = mapped_column(String(255))
    metal: Mapped[str] = mapped_column(String(255))
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    diameter: Mapped[float | None] = mapped_column(Float, nullable=True)
    die_axis: Mapped[str | None] = mapped_column(String(32), nullable=True)
    obverse_description: Mapped[str] = mapped_column(Text)
    reverse_description: Mapped[str] = mapped_column(Text)
    obverse_inscription: Mapped[str | None] = mapped_column(Text, nullable=True)
    reverse_inscription: Mapped[str | None] = mapped_column(Text, nullable=True)
    monograms: Mapped[str | None] = mapped_column(Text, nullable=True)
    reference_list: Mapped[str | None] = mapped_column(Text, nullable=True)
    catalog_number: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_database: Mapped[str | None] = mapped_column(String(255), nullable=True)
    provenance_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    previous_owners: Mapped[str | None] = mapped_column(Text, nullable=True)
    auction_history: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimate_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sale_price: Mapped[str | None] = mapped_column(String(255), nullable=True)
    obverse_image_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reverse_image_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    lot_description_raw: Mapped[str | None] = mapped_column(Text, nullable=True)
    lot_description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    source_type: Mapped[str] = mapped_column(String(64), default="museum")

    candidates: Mapped[list["OnlineCoin"]] = relationship("OnlineCoin", back_populates="museum_coin")
    matches: Mapped[list["MatchRecord"]] = relationship("MatchRecord", back_populates="museum_coin")


class OnlineCoin(Base):
    __tablename__ = "online_coins"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    museum_coin_id: Mapped[str | None] = mapped_column(ForeignKey("museum_coins.coin_id", ondelete="SET NULL"), nullable=True)
    similarity_score: Mapped[float] = mapped_column(Float, default=0.0)
    listing_reference: Mapped[str] = mapped_column(String(255))
    sale_date: Mapped[str | None] = mapped_column(String(64), nullable=True)
    estimate_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sale_price: Mapped[str | None] = mapped_column(String(255), nullable=True)
    listing_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    mint: Mapped[str | None] = mapped_column(String(255), nullable=True)
    authority: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_range: Mapped[str | None] = mapped_column(String(255), nullable=True)
    denomination: Mapped[str | None] = mapped_column(String(255), nullable=True)
    metal: Mapped[str | None] = mapped_column(String(255), nullable=True)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    diameter: Mapped[float | None] = mapped_column(Float, nullable=True)
    die_axis: Mapped[str | None] = mapped_column(String(32), nullable=True)
    obverse_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    reverse_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    obverse_inscription: Mapped[str | None] = mapped_column(Text, nullable=True)
    reverse_inscription: Mapped[str | None] = mapped_column(Text, nullable=True)
    monograms: Mapped[str | None] = mapped_column(Text, nullable=True)
    reference_list: Mapped[str | None] = mapped_column(Text, nullable=True)
    catalog_number: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_database: Mapped[str | None] = mapped_column(String(255), nullable=True)
    provenance_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    previous_owners: Mapped[str | None] = mapped_column(Text, nullable=True)
    auction_history: Mapped[str | None] = mapped_column(Text, nullable=True)
    obverse_image_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reverse_image_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    lot_description_raw: Mapped[str | None] = mapped_column(Text, nullable=True)
    lot_description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    source_name: Mapped[str | None] = mapped_column(String(128), nullable=True)

    museum_coin: Mapped[MuseumCoin | None] = relationship("MuseumCoin", back_populates="candidates")
    matches: Mapped[list["MatchRecord"]] = relationship("MatchRecord", back_populates="online_coin")


class MatchRecord(Base):
    __tablename__ = "matches"
    __table_args__ = (
        Index("uq_match_pair", "museum_coin_id", "candidate_id", unique=True),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    museum_coin_id: Mapped[str] = mapped_column(ForeignKey("museum_coins.coin_id"))
    candidate_id: Mapped[str | None] = mapped_column(ForeignKey("online_coins.id"), nullable=True)
    similarity_score: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(32), default="Pending")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    saved_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    decided_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    museum_coin: Mapped[MuseumCoin] = relationship("MuseumCoin", back_populates="matches")
    online_coin: Mapped[OnlineCoin | None] = relationship("OnlineCoin", back_populates="matches")
    decided_by_user: Mapped[User | None] = relationship("User", back_populates="matches")


class SearchJob(Base):
    __tablename__ = "search_jobs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: uuid.uuid4().hex)
    job_type: Mapped[str] = mapped_column(String(16))  # image | text
    museum_coin_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    query_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    obverse_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reverse_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="pending")
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    result_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_by_user: Mapped[User | None] = relationship("User")

