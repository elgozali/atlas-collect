# Frontend architecture

## Responsibilities

- `src/app`: app shell, query client, demo reset adapter, theme and SCSS entrypoint/partials.
- `src/router`: route definitions, lazy screen loading and navigation side effects; error recovery lives in its own reusable component.
- `src/features/discovery`: home, browse, URL-owned category/search, local filters and sorting.
- `src/features/listings`: gallery, fixed-price listing and purchase orchestration.
- `src/features/offers`: offer entry, validation, seller-response simulation and counter acceptance.
- `src/features/auctions`: countdown, bid submission, versioned event subscription and demo scenarios.
- `src/features/seller`: category field registry, Zod schemas, seven-step RHF wizard and dashboard.
- `src/features/transactions`: checkout, confirmation, lifecycle, inspection and disputes.
- `src/features/notifications`: notification types, service and polling hook.
- `src/components`: one component per file for verification, valuation, protection, cards, trust details, headings, loading, errors and route recovery.
- `src/shared`: pure asset/currency/date formatters, the small client UI store, and the common realtime subscription contract. Domain models and query/mutation hooks live in their owning feature.
- `src/mocks`: seeded data and an asynchronous mock command/query service, with unit tests.

## Feature boundaries

Features with domain operations own `api.ts`, `hooks.ts`, and `types.ts`. Screens import their feature hooks; cross-feature screens reuse the owning domain hook and type instead of duplicating them. Discovery uses listing hooks, and the seller dashboard composes listing, offer and transaction hooks. Neither needs copies of those contracts. Seller drafts and submission payloads belong to the seller feature; converting a draft into a public listing is handled by its service.

Feature services are the only feature modules that import the mock database. This common simulated backend keeps reservation, offer and auction rules consistent; it is not a global frontend API consumed by screens. The shared realtime adapter exposes event subscription, and `app/demo.ts` exposes reset for the shell. Replace feature service implementations when connecting a real backend.

Styles use Sass via `src/app/styles.scss`, with ordered partials under `src/app/styles/` for foundations, layouts, components, feature screens and responsive overrides. The cascade order is preserved. Material UI and its icons use v9.4.0; removed legacy `Outline` icon imports use `Outlined`.

## State ownership

TanStack Query owns listings, auctions, offers, transactions and notifications. Queries are cached; mutations wait for command confirmation. Commercial mutations do not blindly retry.

Zustand owns only saved-item selections and the comparison tray. RHF owns the active wizard form; a sessionStorage draft supports continuing during the same browser session. No auction or transaction entity is copied into Zustand.

Category/search are in the URL. Local filter controls, dialogs and gallery state stay in the component.

## Mock API and realtime contract

The service exposes explicit commands (`bid`, `purchase`, `offerAction`, `pay`, `advance`, `acceptInspection`, `dispute`) and query functions. Commands validate against the current mock state after the simulated delay. JavaScript serializes the synchronous commit section within a tab. The production replacement must enforce equivalent invariants in backend database transactions.

Bids and purchases accept idempotency keys. Offers require the expected version. A listing can be reserved once, and competing offers close when it is reserved. Bid events include an ID, entity ID, version, timestamp and authoritative auction snapshot. The auction cache only accepts newer versions; subscriptions clean up on unmount. A periodic snapshot fetch provides recovery, while events keep the page current. Listing discovery caches are invalidated on auction updates.

The countdown renders an API-provided end time relative to estimated server time. The mock API owns auction closure and the final-two-minute extension. Auction winners enter the same protected transaction flow as fixed-price buyers. The mock close control deliberately accelerates the deadline for demonstration.

Buyer offers receive a simulated seller counter only while their dialog is open; reopening the dialog resumes the response. Further buyer counters return to pending. The seller dashboard acts on the same offer records.

## Transaction state machine

`payment_pending → payment secured → authentication received → authentication passed → in transit → delivered → inspection → completed`

Payment is required before fulfilment advances. Inspection lasts 48 hours in the model. Explicit buyer acceptance completes the transaction. A dispute may be opened only during inspection and pauses completion. Automated settlement after the inspection deadline, refunds and dispute resolution are backend concerns not implemented in this prototype.

## Listing schema and private data

A category-specific field registry renders forms and creates the matching Zod schema. Watches require reference/year/condition; cards require franchise/set/edition/grader/grade. Auction reserve must be at least the starting bid. Media must be present; uploads are restricted to small JPEG/PNG/WebP files.

The private serial/certificate is retained in the session draft for demo continuity but excluded from the public listing payload. No real identifiers should be used. A production private verification endpoint would persist and authorize this separately. Submitted listings are `review` and cannot be purchased until approved. Auction launch and verification review are outside the eight-screen scope.

Sale method, offer permission, reserve and duration are retained with the submitted listing. Sample valuation is category-specific, not a live appraisal engine.

## Persistence and limitations

The mock database is browser-local and persisted to localStorage when available; storage failures fall back to memory. Drafts use sessionStorage. Refresh preserves the demo database; reset starts over. Images uploaded into drafts are data URLs and may exceed browser storage capacity with multiple large images; session storage reports failures.

This is a single-tab simulation with no cross-tab locking or synchronization. There is no real user login/RBAC/KYC, websocket server, payment processing, serial protection, TLS backend, upload scanning, queue/outbox or carrier integration. UI guards are not authorization. Replace `src/mocks/api.ts` with a typed HTTPS client and production realtime adapter to integrate Laravel; enforce every commercial rule again on the backend.

## Design and delivery

The MUI theme defines ivory/stone surfaces, charcoal text, forest green actions and consistent shapes. Prices and countdowns use tabular numerals. Lazy routes limit seller/form code on discovery. Fonts/images are local. Semantic controls, MUI dialogs, focus states, a skip link, reduced-motion support and mobile purchase actions support accessibility.

HashRouter makes this a portable static application; Vite base configuration supports GitHub Pages repository paths. CI verifies the domain tests, strict build and desktop/mobile journey suite.

Reference documentation: [MUI theming](https://mui.com/material-ui/customization/theming/) and [TanStack Query QueryClient](https://tanstack.com/query/latest/docs/framework/react/reference/classes/QueryClient).
