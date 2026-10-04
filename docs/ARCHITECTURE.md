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
- `src/components`: one component per file for verification, valuation, protection, cards, trust details, headings, loading, errors and route recovery.
- `src/utils`: pure asset/currency/date formatters.
- `src/shared`: the small client UI store and common realtime subscription contract.
- `src/styles`: global foundations plus shared component/layout styles. Features import their own scoped SCSS modules.
- `src/mocks`: feature-specific command/query services, a shared core database/realtime layer and reservation helper, seeded data, and contract tests.

## Feature boundaries

Every feature exposes an `index.ts` entry point. It exports the feature views and, where applicable, hooks and types. Implementation lives under `components/`, `hooks/`, `types/`, and `services/`; each hook and type has a named file. Seller validation lives in `schemas/`, and transaction step labels in `constants/`. Folders are added when they have a real responsibility: discovery composes listing hooks instead of duplicating the listing service and model.

All route pages live in `src/pages/`. These thin route components import the feature entry point and render its view. `src/router/AppRouter.tsx` lazy-loads pages; features do not contain page folders. Providers wrap the app once from `main.tsx`, and `App.tsx` composes `AppLayout` with `AppRouter`.

Feature client adapters live in `services/` and import their corresponding domain mock service directly. The mock `api.ts` is a small compatibility facade for contract tests, with no command logic inside it. Domain implementations live in `mocks/listings`, `mocks/auctions`, `mocks/offers`, `mocks/transactions`, `mocks/seller`, and `mocks/notifications`. `mocks/core` owns the shared browser database, seed initialization, persistence, response snapshots, simulated latency, errors and event subscriptions. A listing repository and transaction reservation helper keep cross-feature rules consistent without circular service imports.

Each feature imports `featureName.module.scss`. Its local `root` class scopes descendant styles to that feature view. The module loads base/responsive partials inside that scope; existing descendant class names and MUI classes remain stable. Portaled dialogs and drawers receive the same module root so their styles stay scoped after leaving the view's DOM tree. Confirmation, loading and error branches also retain the feature scope. Auction views reuse listing gallery/layout partials inside the auction module's own scope.

Only foundations, common components and the app layout remain globally styled. Feature modules are imported by their components and loaded with their route bundles. Material UI and icons remain on v9.4.0.

## Folder conventions

```text
src/
  app/
    App.tsx
    layout/
      AppLayout.tsx
      styles/
  providers/
  router/
  pages/
    HomePage.tsx
    BrowsePage.tsx
    ListingPage.tsx
    AuctionPage.tsx
    SellerListingPage.tsx
    SellerDashboardPage.tsx
    CheckoutPage.tsx
    TransactionTimelinePage.tsx
    NotFoundPage.tsx
  features/
    auctions/
      index.ts
      auctions.module.scss
      components/
        LiveAuction.tsx
      hooks/
        useAuction.ts
        useAuctionEvents.ts
        useAuctionScenario.ts
        useBid.ts
        index.ts
      types/
        Auction.ts
        Bid.ts
        index.ts
      services/
        auctionsService.ts
        index.ts
      styles/
        _base.scss
        _responsive.scss
  mocks/
    api.ts                 # Contract-test facade
    api.test.ts
    core/
    listings/
      service.ts
      repository.ts
    auctions/
      service.ts
    offers/
      service.ts
    transactions/
      service.ts
      reservations.ts
    seller/
      service.ts
    notifications/
      service.ts
  components/
  utils/
  shared/
  styles/
```

The other features follow the same conventions where needed. Global page files own routing boundaries; feature components own the experience. Hook/type subfolder exports allow domain consumers to reuse contracts without importing feature UI.

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
