# CoinMatch

CoinMatch is a frontend prototype for museum researchers to identify potentially missing or stolen coins by comparing internal records with auction listings. The project delivers an elegant research console ready to connect to backend APIs, ML services, and museum data stores.

## Repository Structure

- `README.md` – this overview.
- `docs/` – product brief, API contract, and canonical coin metadata schema.
- `app/` – Vite + React (TypeScript) frontend with Tailwind styling.
- `backend/` – FastAPI backend (Python) providing REST APIs, ingestion, and matching.

## Getting Started

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# optional: configure via environment variables
export COINMATCH_DATABASE_URL="sqlite:///./coinmatch.db"
export COINMATCH_SECRET_KEY="dev-secret"

python -m app.seed          # create schema and sample data (once)
uvicorn app.main:app --reload
```

### Frontend
```bash
cd app
npm install
echo "VITE_API_BASE_URL=http://127.0.0.1:8000" > .env.local
npm run dev
```

Default login (from the seed script): `laure_marest@harvard.edu / coinmatch123`.

## Key Features

- **Unified coin model**: both museum and online coins follow the schema in `docs/coin_metadata.md`, including imagery, measurements, inscriptions, and provenance fields.
- **Data ingestion**: ingest remote JSON feeds (`python -m app.ingest` or `POST /api/admin/sync`) and manual uploads (`POST /api/museum-coins`, `POST /api/online-coins`).
- **Matching workflow**: run the heuristic matcher (`POST /api/admin/match`) to create/update `matches`, review in the UI, and mark decisions as `Accepted`, `Rejected`, or `Pending`.
- **Admin tooling**: the frontend `/admin/tools` page supports syncing datasets, running matches, and uploading JSON payloads for testing.

## Documentation

- `docs/API_SPEC.md` – backend contract consumed by the frontend.
- `docs/coin_metadata.md` – detailed coin field definitions.
- `backend/DATA_MODEL.md` – storage schema and matching flow.
- Inline README files inside `app/` and `backend/` explain stack-specific details.

## License

Released under the MIT License. See [LICENSE](LICENSE) for details.
