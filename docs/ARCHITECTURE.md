# Architecture

Atlas Collect is a React/TypeScript frontend prototype built with Vite, Material UI and SCSS Modules.

Marketplace operations run through a browser-local simulation. There is no live backend, user authentication service, payment processor or network API in this repository.

## Frontend structure

| Folder | Responsibility |
| --- | --- |
| `src/app` | App composition, shared layout and demo reset |
| `src/providers` | Theme, TanStack Query and router providers |
| `src/router` | Lazy routes, loading/error boundaries and navigation effects |
| `src/pages` | Route entry components |
| `src/features` | Discovery, listings, auctions, offers, seller, transactions and notifications |
| `src/components` | Reusable cross-feature UI |
| `src/shared` | Shared UI state and realtime subscription adapter/types |
| `src/utils` | Asset paths, AED prices and Dubai date formatting |
| `src/styles` | Global SCSS foundations and shared style utilities |
| `src/mocks` | Seed data, persistence, simulated services/events and command tests |

Features expose selected components, hooks and types through `index.ts` entry points, with supporting services, schemas and styles colocated where needed.

## State ownership

- **TanStack Query** manages listings, the demo auction (including bids), offers, transactions and notifications. Mutations update or invalidate caches.
- **Zustand** stores saved listing IDs and comparison selections (up to three), persisted in `localStorage`.
- **React Hook Form + Zod** handle seller drafts, checkout delivery/consent fields and offer amounts. Other action inputs use local state.
- **URL state** stores browse category and search parameters (`category`, `q`) inside hash routes.
- **Local component state** handles other filters, sorting, dialogs, galleries and wizard steps.

The demo database persists in `localStorage`, with an in-memory fallback if storage is unavailable. Seller drafts are saved to `sessionStorage` through the wizard's save/step actions. Neither storage mechanism is a security boundary.

There is no implemented cross-tab or cross-device synchronization.

## Service boundary

Feature hooks call adapters that delegate directly to mock services; components do not manipulate the database.

```text
React feature → Feature adapter → Mock service
```

The adapters are replacement points for a future backend transport layer. A separate app-level bridge exposes demo reset.

## Marketplace behaviour

### Reservations and offers

Buy Now, accepted offers and the demo user's auction win share a synchronous reservation function. Within one browser runtime, it checks that a listing is active before reserving it and creating a transaction, preventing duplicate reservations. This guarantee does not extend across tabs or clients.

Offer actions check the supplied version, offer state, expiry and current listing availability before applying changes. Offers expire after 24 hours; expiry is checked on an attempted action rather than by a background process.

### Auctions

The seeded Charizard auction supports manual bidding, simulated competing bids, AED 500 minimum increments, a final-window scenario and manual close. A bid within the final two minutes resets the remaining time to two minutes. An expired auction settles when the auction service is read; a demo-user win creates a transaction.

Auction events are simulated in-process. The event subscriber accepts only newer versions into the query cache; this check does not cover every query or mutation response. A ten-second query refresh provides recovery while the auction query is active. Events also invalidate related listing and notification caches.

This is not a WebSocket implementation or general marketplace synchronization.

### Idempotency

Bid and purchase services return stored results for repeated caller-supplied command keys. These results are persisted with the demo database. The shared key map does not validate operation/payload identity or expire entries, so it models a limited retry contract rather than production distributed idempotency.

## Transactions

Buy Now, accepted offers and the demo user's auction win converge into the same simulated lifecycle:

```text
Purchase confirmed → Payment secured → Received for authentication
    → Authentication passed → In transit → Delivered → Inspection
    → Complete / Disputed
```

Every simulated transaction includes collectible authentication; this is distinct from user sign-in. Demo controls advance fulfilment through guarded steps. Accepting inspection marks the transaction completed and the listing sold; opening a dispute blocks completion.

Inspection records and displays a 48-hour deadline, but the prototype does not enforce that deadline or automatically complete transactions. No real funds, escrow, settlement, shipping or dispute-resolution systems are connected.

## Categories and seller listings

Luxury Watches and Trading Cards share listing and negotiation flows. Seller field definitions drive category-specific inputs and required-detail validation. Some browse filters, trust content and valuation behaviour use category-specific branches. Valuation ranges and comparable sales are illustrative.

The seller form validates required details, private serial/certificate input, image presence, price and the auction reserve relationship; upload controls check file type, size and count. This is client-side validation, not verification of authenticity or complete service-side validation of every field.

Private serial/certificate values remain in browser draft data and are omitted from the submitted listing. Submission retains the first image and creates an unverified listing with `review` status, excluded from browse and unavailable for purchase. No review-to-active approval transition or live auction creation for seller submissions is implemented.

## Deployment

The project builds to a static `dist` bundle and uses hash routing, so static hosting does not require route rewrites. Vercel configuration and a manually triggered GitHub Pages build/deploy workflow are included; the latter sets Vite's repository base path.

These files configure deployment, but do not establish whether a public deployment exists. The application does not provision backend infrastructure or cloud services.

## Proposed production architecture

The following is **proposed only and is not implemented in this repository**. Laravel, MySQL, AWS services and WebSocket transport are future design options.

```text
React / Vite → Laravel REST API → AWS RDS MySQL

Supporting services
├─ Redis             cache / realtime coordination
├─ AWS SQS           asynchronous work
├─ AWS S3/CloudFront  media and frontend delivery
├─ WebSockets        committed-state event delivery
└─ External          payments / KYC / collectible authentication / shipping
```

In production, MySQL would hold authoritative commercial state. Laravel would enforce user authentication, authorization, validation and transaction rules. Reservations would be atomic across clients, idempotency durable and deadlines enforced server-side. Realtime events would follow committed state changes; frontend controls and browser storage would not be trusted as security boundaries.

## Prototype limits

The prototype does not implement live user authentication/authorization, a Laravel/MySQL backend, distributed synchronization, WebSockets, real payments or KYC, physical collectible authentication, shipping integrations, automatic inspection settlement, listing approval workflows or operational dispute resolution.
