# Atlas Collect

A high-fidelity interactive concept for an authenticated collectibles marketplace. Built for the Greenstone Senior Frontend Engineer assignment, following the agreed product, architecture and eight-experience scope.

**React + TypeScript + Vite + Material UI 9.4.0 + SCSS Modules + classnames + React Router + TanStack Query + Zustand + React Hook Form + Zod.**

## Run locally

Use Node 22.12 or later (the `.nvmrc` selects Node 22).

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

```sh
npm test             # Domain and category validation tests
npm run build        # Strict TypeScript and production build
npm run preview      # Serve the production build locally
npm run format:check # Formatting
```

Browser regression tests are included for the three journeys at desktop and mobile sizes:

```sh
npx playwright install chromium
npm run test:e2e
```

## Eight core experiences

| Experience | Route |
| --- | --- |
| Marketplace home | `/#/` |
| Browse, filters, search and comparison | `/#/marketplace` |
| Fixed-price listing | `/#/listings/rolex` |
| Live card auction | `/#/auctions/charizard` |
| Seller listing wizard | `/#/sell` |
| Seller dashboard and offers | `/#/seller` |
| Checkout and confirmation | `/#/checkout/:transactionId` |
| Protected transaction timeline | `/#/transactions/:transactionId` |

Comparables, offers, counteroffers, image inspection, notifications and disputes are dialogs/drawers within these experiences. No additional account or admin screens are added.

## The three demo journeys

1. **Fixed-price buyer:** Home → Watches → Rolex → Review valuation/authentication → Make an offer of AED 42,000 → Simulated seller counter at AED 44,000 → Accept → Complete sample delivery details → Simulate secure payment → Track transaction → Simulate updates to inspection → Accept the item or report an issue. Buy Now also works as a direct route into checkout.
2. **Live auction:** Trading cards → Charizard → Place AED 25,000 bid → Wait for the automatic competing bid → Bid again. Use “Jump to final 30 seconds” then place a bid to demonstrate the two-minute extension. Switch the automatic competitor off, bid, then “Close auction now” to reach winner checkout.
3. **Seller:** Sell → Choose watch/card → Category-specific details → Use sample details if needed → Sample private identifier → Demo image or upload → Valuation → Fixed-price/auction settings → Review → Submit → Seller studio. The listing remains pending verification. Seller offers support accept, counter and reject.

The footer's **Reset demo** restores the sample data, clears the draft, and returns you home. Use it between rehearsals.

## Public hosting and GitHub

The application uses **hash routing**, so deep links and refreshes work on static hosting without rewrite rules. Every route sits after `/#/`. Assets are local and use Vite's configured base path; fonts are self-hosted.

- **Vercel:** Import this repository. Vite is detected; `vercel.json` sets build/output.
- **GitHub Pages:** In repository Settings → Pages choose **GitHub Actions**. Run the included **Publish GitHub Pages** workflow manually. It sets `VITE_BASE_PATH` to the repository name and deploys `dist`. For a user/organization root site or custom domain, use `/` for the base instead.
- **Any static host:** Run `npm run build` and upload the contents of `dist`.

An included checks workflow runs unit tests, the production build and the browser journey suite on pushes and pull requests. Publishing is a separate manually triggered workflow.

This checkout is prepared locally. Creating a GitHub remote and publishing a public URL are separate actions; no remote repository is assumed.

## Architecture and prototype boundaries

All route screens live in `src/pages/` and render views exported by feature `index.ts` entry points. Features own their `components/`, `hooks/` (one file per hook), `types/`, `services/`, and named SCSS module. Components have their own folders and matching SCSS Modules. Each feature module includes its responsive rules; only global styles retain base/responsive partials. JSX uses module references and `classnames` for combinations. Public exports live exclusively in each feature’s main `index.ts`; internal imports reference individual files. Shared utilities live in `utils/`, providers in `providers/`, and the shell in `app/layout/`. Mock commands are split by feature under `mocks/`, with persistence, realtime and reservation rules shared.

See [Architecture](docs/ARCHITECTURE.md), [Demo and QA notes](docs/QA.md), and [Image sources](docs/ASSETS.md).

All commercial interactions are **simulated**. No real authentication provider, backend, verification service, payment processor or shipping carrier is connected. The mock command layer represents the production contract; it is not a security boundary. Each visitor gets their own sample state.

The Charizard sample uses the **Unlimited** edition to match the provided artwork. Values, grades, condition, certificates, ratings, offers and comparable sales are illustrative. Atlas is a concept; no affiliation with the depicted brands is implied.
