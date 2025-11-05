from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, coins, matches, search
from app.config import get_settings
from app.db.base import Base
from app.db.session import engine


settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router)
app.include_router(coins.router)
app.include_router(search.router)
app.include_router(matches.router)


@app.get("/health")
def healthcheck():
    return {"status": "ok"}

