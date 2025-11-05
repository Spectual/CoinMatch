from datetime import datetime, timedelta
import uuid

from passlib.hash import pbkdf2_sha256
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import SessionToken, User


settings = get_settings()


def hash_password(password: str) -> str:
    return pbkdf2_sha256.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pbkdf2_sha256.verify(password, password_hash)


def authenticate_user(db: Session, email: str, password: str) -> tuple[User, SessionToken] | None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    token = SessionToken(
        id=uuid.uuid4().hex,
        user_id=user.id,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(minutes=settings.token_expiry_minutes)
    )
    db.add(token)
    db.flush()
    return user, token


def get_user_by_token(db: Session, token: str) -> User | None:
    session = (
        db.query(SessionToken)
        .filter(SessionToken.id == token, SessionToken.expires_at > datetime.utcnow())
        .first()
    )
    if not session:
        return None
    return session.user

