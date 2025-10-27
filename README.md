# CoinMatch

CoinMatch is a frontend prototype for museum researchers to identify potentially missing or stolen coins by comparing internal records with auction listings. The project delivers an elegant research console ready to connect to backend APIs, ML services, and museum data stores.

## Repository Structure

- `CoinMatch_Product_Description.md` – original product brief outlining experience goals.
- `coin_metadata.md` – canonical schema for coin records (mint, authority, provenance, imagery, etc.).
- `app/` – Vite + React + Tailwind implementation of the CoinMatch UI.

## Getting Started

```bash
cd app
npm install  # install dependencies (requires network access)
npm run dev  # launch the development server
```

Additional scripts are defined in `app/package.json` for production builds (`npm run build`) and previews (`npm run preview`).

## Tech Stack

- React 18 with React Router
- TailwindCSS for styling
- Heroicons + Headless UI components
- TypeScript and Vite for bundling

## Contributing

1. Fork the repository and create a feature branch.
2. Install dependencies from the `app/` directory and run `npm run dev` for local development.
3. Keep UI additions aligned with the aesthetic described in the product brief.
4. Open a pull request summarizing changes and any outstanding questions.

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.
