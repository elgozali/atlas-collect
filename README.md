# Atlas Collect

An interactive marketplace prototype for luxury watches and trading cards, with fixed-price purchases, live auctions, and seller listing flows.

Built with React, TypeScript, Vite, Material UI, SCSS Modules, React Router, TanStack Query, Zustand, React Hook Form, and Zod.

## Getting started

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Scripts

| Command                | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the development server              |
| `npm run build`        | Check TypeScript and build for production |
| `npm run preview`      | Preview the production build              |
| `npm test`             | Run unit tests                            |
| `npm run test:e2e`     | Run desktop and mobile browser tests      |
| `npm run format:check` | Check formatting                          |
| `npm run format`       | Format source and configuration files     |

Install the browser before running end-to-end tests:

```sh
npx playwright install chromium
```

## Features

- Browse watches and cards with search, filters, saved items, and comparison.
- Review provenance and valuation, buy at a fixed price, or negotiate an offer.
- Bid in a live auction with competing bids and a two-minute late-bid extension.
- Create a listing through a category-specific form and manage seller offers.
- Follow checkout, authentication, delivery, inspection, and dispute states.

Use **Reset demo** in the footer to restore the sample data. See [Demo and testing](docs/QA.md) for walkthroughs.

## Deployment

Import the repository into Vercel. The included `vercel.json` uses `npm run build` and serves `dist`.

Hash routing supports static hosting without route rewrites. A manual GitHub Pages workflow is also included; it sets `VITE_BASE_PATH` for repository sites. The checks workflow runs unit tests, the build, and browser tests on pushes and pull requests.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Demo and testing](docs/QA.md)
- [Image sources](docs/ASSETS.md)

## Prototype scope

Data, bids, payments, and fulfilment are simulated in the browser. There is no live backend, payment provider, or authentication service. Sample values and verification details are illustrative.
