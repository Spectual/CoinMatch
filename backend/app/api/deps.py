from typing import Generator, Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import session_scope
from app.models import User
from app.services.auth import get_user_by_token


def get_db() -> Generator[Session, None, None]:
    with session_scope() as session:
        yield session


def get_current_user(
    db: Session = Depends(get_db),
    x_session_token: Optional[str] = Header(None, alias="X-Session-Token")
) -> User:
    if not x_session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing session token")
    user = get_user_by_token(db, x_session_token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")
    return user

