## CoinMatch Backend

FastAPI service that powers the CoinMatch research console.

### Quick Start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export COINMATCH_DATABASE_URL="sqlite:///./coinmatch.db"
export COINMATCH_SECRET_KEY="dev-secret"

python -m app.seed   # one-time: create tables + sample data
uvicorn app.main:app --reload
```

### Project Structure

- `app/main.py` – FastAPI entry point, CORS config, router registration
- `app/config.py` – environment-driven settings (database, CORS, token expiry)
- `app/models.py` – SQLAlchemy ORM models (`users`, `museum_coins`, `candidate_listings`, `matches`, `search_jobs`)
- `app/api/routes/` – REST endpoints (`auth`, `coins`, `search`, `matches`)
- `app/services/` – domain logic (auth, catalog queries, match persistence, placeholder search)
- `app/seed.py` – loads curator login, museum records, auction candidates, match history
- `requirements.txt` – Python dependencies (FastAPI, SQLAlchemy, Alembic, etc.)

### Default Accounts

- Email: `laure_marest@harvard.edu`
- Password: `coinmatch123`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COINMATCH_DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./coinmatch.db` |
| `COINMATCH_SECRET_KEY` | Token signing secret | `change-this-key` |
| `COINMATCH_CORS_ORIGINS` | Comma-separated origins allowed for CORS | `http://127.0.0.1:5173,http://localhost:5173` |

### Deployment Notes

- Use PostgreSQL (e.g. Amazon RDS) in production; set `COINMATCH_DATABASE_URL` accordingly.
- Store imagery in S3; populate `obverse_image_key` / `reverse_image_key` with S3 object keys.
- Containerize with Uvicorn/Gunicorn and deploy via ECS Fargate or similar. Grant IAM access to the database and S3 bucket.

### Handy Commands

```bash
# Run database migrations (future use)
alembic upgrade head

# Drop & reseed dev database
rm -f coinmatch.db
python -m app.seed
```

See `docs/API_SPEC.md` for the contract consumed by the React frontend.
