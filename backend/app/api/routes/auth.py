from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.schemas import UserLoginRequest, UserLoginResponse, UserProfile
from app.services.auth import authenticate_user


router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/login", response_model=UserLoginResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    auth = authenticate_user(db, payload.email, payload.password)
    if not auth:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user, token = auth
    return UserLoginResponse(
        token=token.id,
        user=UserProfile(name=user.name, email=user.email)
    )


@router.get("/user/profile", response_model=UserProfile)
def get_profile(user=Depends(get_current_user)):
    return UserProfile(name=user.name, email=user.email)


@router.post("/logout")
def logout(user=Depends(get_current_user)):
    # With simple token auth, the client deletes the stored token; server-side cleanup can be added later.
    return {"detail": f"Session cleared for {user.email}"}

