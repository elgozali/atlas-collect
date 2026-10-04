# Frontend architecture

## Responsibilities

- `src/app`: small app composition, demo reset adapter and `layout/` for the shared page shell.
- `src/providers`: theme, query and router providers, their composition, theme configuration and the query client.
- `src/pages`: all eight route screens and the not-found page. Pages render feature entry components.
- `src/router`: route definitions, lazy screen loading and navigation side effects; error recovery lives in its own reusable component.
- `src/features/discovery`: home, browse, URL-owned category/search, local filters and sorting.
- `src/features/listings`: gallery, fixed-price listing and purchase orchestration.
- `src/features/offers`: offer entry, validation, seller-response simulation and counter acceptance.
- `src/features/auctions`: countdown, bid submission, versioned event subscription and demo scenarios.
- `src/features/seller`: category field registry, Zod schemas, seven-step RHF wizard and dashboard.
- `src/features/transactions`: checkout, confirmation, lifecycle, inspection and disputes.
- `src/features/notifications`: notification types, service and polling hook.
- `src/components`: one folder and SCSS Module per component for verification, valuation, protection, cards, trust details, headings, loading, errors and route recovery.
- `src/utils`: pure asset/currency/date formatters.
- `src/shared`: the small client UI store and common realtime subscription contract.
- `src/styles`: global foundations and a shared utility SCSS Module. Layout, components and features import scoped SCSS Modules.
- `src/mocks`: feature-specific command/query services, a shared core database/realtime layer and reservation helper, seeded data, and contract tests.

## Feature boundaries

Every feature exposes an `index.ts` entry point. It exports the feature views and, where applicable, hooks and types. Implementation lives under `components/`, `hooks/`, `types/`, and `services/`; each hook and type has a named file. Seller validation lives in `schemas/`, and transaction step labels in `constants/`. Folders are added when they have a real responsibility: discovery composes listing hooks instead of duplicating the listing service and model.

All route pages live in `src/pages/`. These thin route components import the feature entry point and render its view. `src/router/AppRouter.tsx` lazy-loads pages; features do not contain page folders. Providers wrap the app once from `main.tsx`, and `App.tsx` composes `AppLayout` with `AppRouter`.

Feature client adapters live in `services/` and import their corresponding domain mock service directly. The mock `api.ts` is a small compatibility facade for contract tests, with no command logic inside it. Domain implementations live in `mocks/listings`, `mocks/auctions`, `mocks/offers`, `mocks/transactions`, `mocks/seller`, and `mocks/notifications`. `mocks/core` owns the shared browser database, seed initialization, persistence, response snapshots, simulated latency, errors and event subscriptions. A listing repository and transaction reservation helper keep cross-feature rules consistent without circular service imports.

Each feature has one `featureName.module.scss` containing its styles and responsive rules. There are no feature `styles/` folders or base/responsive partials. Components live in their own folders with a matching `ComponentName.module.scss`; reusable components own their complete styling, while feature view modules provide a root container and their feature module owns the experience's styling.

JSX references module exports directly, such as `className={s.headingRow}`. Multiple and conditional classes use `classnames`. `styles/common.module.scss` owns reused presentation utilities and buyer/auction gallery layout. Only `styles/_base.scss` and `styles/_responsive.scss` supply global foundations and MUI defaults. Dialogs and drawers use the same module references as inline content, independent of their portal placement.

Vite scopes classes with a deterministic module namespace (`ModuleName__className`). Module filenames must remain unique. A few contextual selectors explicitly target another module's namespaced class, such as browse-card image sizing; Material UI selectors use `:global(.Mui...)`. There is no blanket global feature scope. Material UI and icons remain on v9.4.0.

## Folder conventions

```text
src/
  app/
    App.tsx
    layout/
      AppLayout.tsx
      AppLayout.module.scss
  providers/
  router/
  pages/                      # All route boundaries
  features/
    auctions/
      index.ts                # Only externally consumed exports
      auction.module.scss     # Feature styling and media queries
      components/
        LiveAuction/
          LiveAuction.tsx
          LiveAuction.module.scss
      hooks/
        useAuction.ts
        useAuctionEvents.ts
        useAuctionScenario.ts
        useBid.ts
      types/
        Auction.ts
        Bid.ts
      services/
        auctionsService.ts
  mocks/
    api.ts                    # Contract-test facade
    api.test.ts
    core/
    listings/
    auctions/
    offers/
    transactions/
    seller/
    notifications/
  components/
    Loading/
      Loading.tsx
      Loading.module.scss
  utils/
  shared/
  styles/
    index.scss
    _base.scss
    _responsive.scss
    common.module.scss
```

Each feature's main `index.ts` explicitly exports only hooks, services, types, components or constants imported outside that feature. There are no nested hook/type/service barrel files. Internal code imports the specific implementation file; external consumers import the feature entry point. Service adapters currently have no external consumers and remain private to their features. Root pages own routing boundaries; feature views own the experiences.

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

This is a single-tab simulation with no cross-tab locking or synchronization. There is no real user login/RBAC/KYC, websocket server, payment processing, serial protection, TLS backend, upload scanning, queue/outbox or carrier integration. UI guards are not authorization. Replace the feature service adapters with typed HTTPS clients and the shared realtime adapter with a production connection to integrate Laravel; enforce every commercial rule again on the backend.

## Design and delivery

The MUI theme defines ivory/stone surfaces, charcoal text, forest green actions and consistent shapes. Prices and countdowns use tabular numerals. Lazy routes limit seller/form code on discovery. Fonts/images are local. Semantic controls, MUI dialogs, focus states, a skip link, reduced-motion support and mobile purchase actions support accessibility.

HashRouter makes this a portable static application; Vite base configuration supports GitHub Pages repository paths. CI verifies the domain tests, strict build and desktop/mobile journey suite.

Reference documentation: [MUI theming](https://mui.com/material-ui/customization/theming/) and [TanStack Query QueryClient](https://tanstack.com/query/latest/docs/framework/react/reference/classes/QueryClient).
