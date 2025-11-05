# CoinMatch Frontend

This directory contains the CoinMatch React prototype. It is tailored for museum researchers verifying potential matches between Dewing collection records and external auction listings.

## Setup

```bash
npm install
npm run dev
```

- Create a `.env.local` file (or export an environment variable) to point the frontend at the FastAPI service:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

- `npm run build` – Type-checks and bundles the production build.
- `npm run preview` – Serves the Vite production bundle locally.

## Project Highlights

- Lazy-loaded route structure with shared sidebar/top-bar layout.
- Screens for login, dashboard, missing coins registry, detailed record view, comparison workspace, search results, and match history.
- Mock data aligned with the coin metadata schema (`../coin_metadata.md`).
- TailwindCSS for the museum-inspired visual language.

## Testing & Linting

No automated tests or linting commands are configured yet. Add your preferred tooling (e.g., Vitest, Playwright, ESLint) before integrating the prototype into production workflows.
