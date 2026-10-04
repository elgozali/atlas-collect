# Architecture

## Structure

| Folder           | Responsibility                                                                 |
| ---------------- | ------------------------------------------------------------------------------ |
| `src/app`        | App composition, shared layout, and demo reset                                 |
| `src/providers`  | Theme, query, and router providers                                             |
| `src/router`     | Lazy routes and navigation effects                                             |
| `src/pages`      | Route entry components                                                         |
| `src/features`   | Discovery, listings, auctions, offers, seller, transactions, and notifications |
| `src/components` | Reusable UI components                                                         |
| `src/shared`     | UI store and realtime adapter                                                  |
| `src/utils`      | Asset, currency, and date formatters                                           |
| `src/styles`     | Global foundations and shared style utilities                                  |
| `src/mocks`      | Feature mock services, shared database, and command tests                      |

Features keep components, hooks, services, and types in separate folders, with schemas and constants where needed. Each feature's `index.ts` exports only what other parts of the app consume. Internal imports reference individual files.

Components have their own folders and SCSS Modules. Feature modules include responsive rules; global base and responsive styles live in `src/styles`. JSX uses module references and `classnames` for conditional styles. Module filenames must be unique because the scoped class format is `ModuleName__className`.

## State

- **TanStack Query:** listings, bids, offers, transactions, and notifications.
- **Zustand:** saved items and comparison selections.
- **React Hook Form and Zod:** seller and checkout forms, with category-specific validation.
- **URL:** category and search parameters.
- **Component state:** dialogs, filters, gallery selection, and wizard steps.

The mock database persists in `localStorage`; seller drafts use `sessionStorage`. Reset restores the seed data and clears drafts and UI selections.

## Services and realtime

Feature service adapters call their corresponding mock services. The shared mock core handles persistence, latency, snapshots, errors, and events. Reservation rules are shared between purchases and accepted offers.

Bids and purchases support idempotency keys. Offers use version checks. Reservations prevent an item from being sold twice. Auction events carry versioned snapshots; subscriptions apply newer versions, with periodic queries providing recovery. Bids placed in the final two minutes extend the deadline to two minutes from the accepted bid.

To connect a backend, replace the feature service adapters and shared realtime adapter. The backend must enforce reservation, bidding, payment, and authorization rules.

## Transactions and listings

Transactions progress through payment, authentication, shipping, delivery, inspection, and completion. Payment is required before fulfilment. The inspection window is 48 hours; accepting the item completes the transaction, while reporting an issue pauses it as disputed.

Seller fields depend on the category. Media is required, and an auction reserve cannot be below the starting bid. Private serial and certificate values stay in the session draft and are excluded from public listing payloads. Submitted listings remain pending review and cannot be purchased.

## Limits

The simulation runs within one browser tab and has no cross-tab synchronization. Authentication, physical verification, payment processing, shipping integrations, automated inspection settlement, and dispute resolution require backend services.
