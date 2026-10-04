# Atlas Collect

**Authenticated collectibles. Transparent value. Confident trading.**

Atlas Collect is an interactive marketplace concept for discovering, valuing, buying and selling authenticated high-value collectibles.

The prototype was created for the Greenstone Senior Frontend Engineer assignment and explores product thinking, frontend architecture, simulated realtime marketplace interactions, transparent valuation, trust and protected transactions across **Luxury Watches** and **Trading Cards**.

**Live prototype:** _Add public deployment URL_

- [Architecture](docs/ARCHITECTURE.md)
- [Demo and testing](docs/QA.md)
- [Image sources](docs/ASSETS.md)

## Tech stack

React · TypeScript · Vite · Material UI · SCSS Modules · React Router · TanStack Query · Zustand · React Hook Form · Zod

## Core experiences

The prototype covers eight primary marketplace experiences:

| Experience | Route |
| --- | --- |
| Marketplace home | `/#/` |
| Browse, search, filters and comparison | `/#/marketplace` |
| Fixed-price watch listing | `/#/listings/rolex` |
| Live trading-card auction | `/#/auctions/charizard` |
| Seller listing wizard | `/#/sell` |
| Seller dashboard and offers | `/#/seller` |
| Checkout and confirmation | `/#/checkout/:transactionId` |
| Protected transaction timeline | `/#/transactions/:transactionId` |

Supporting interactions such as comparables, offers, counteroffers, image inspection, notifications and disputes are handled through dialogs and drawers within these experiences.

## Product flows

### Fixed-price buyer

Browse → Evaluate valuation and provenance → Buy Now or Make an Offer → Negotiate → Secure payment → Authentication → Delivery → Inspection → Completion or dispute.

### Live auction

Discover auction → Place bid → Receive realtime competing bids → Bid again → Late-bid extension → Auction close → Winner checkout.

### Seller

Choose category → Enter category-specific details → verification information → Add media → Review Atlas valuation → Choose sale method → Review → Submit → Manage listing and offers.

Use **Reset demo** in the footer to restore the original sample state between walkthroughs.

## Getting started

Requires Node.js **22.12 or later**.

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

## Architecture

The frontend is organized around feature boundaries with explicit ownership of server-style, shared client and local UI state.

- **TanStack Query** manages listings, auctions, offers, transactions and notifications.
- **Zustand** stores lightweight shared UI state such as saved listings and comparison selections.
- **React Hook Form + Zod** handle seller, checkout and offer forms.
- Feature adapters isolate UI code from the browser-local marketplace simulation.
- Simulated auction events demonstrate versioned realtime updates without pretending to provide a production WebSocket backend.

See [Architecture](docs/ARCHITECTURE.md) for implementation details and the proposed production mapping.

## Prototype boundaries

This repository contains a frontend product prototype, not a production marketplace.

All commercial interactions are simulated in the browser. There is no live Laravel backend, user authentication service, payment processor, KYC provider, collectible-authentication service or shipping integration.

The mock services represent marketplace behaviour and intended frontend contracts; they are not a security boundary.

Submitted seller listings remain pending review and are not automatically approved for purchase.

## Testing

Automated checks cover:

- domain and category validation
- bid concurrency and idempotency behaviour
- offer version handling
- listing reservation
- auction extension and settlement
- transaction transitions and disputes
- production TypeScript builds
- the three primary browser journeys
- desktop and mobile viewports

See [Demo and testing](docs/QA.md) for walkthroughs and manual QA guidance.

## Deployment

The application builds to a static `dist` bundle and uses hash routing for static hosting.

Configuration is included for:

- Vercel
- GitHub Pages

The repository's checks workflow runs tests, the production build and browser journeys on pushes and pull requests.

Once deployed, the public URL is listed at the top of this README.

## Sample content

The Charizard example uses the **Unlimited** Base Set edition to match the supplied artwork.

Prices, grades, certificates, conditions, ratings, offers and comparable sales are illustrative.

Atlas Collect is a product concept and is not affiliated with or endorsed by the brands depicted in the prototype.

Image attribution and source details are documented in [Image sources](docs/ASSETS.md).