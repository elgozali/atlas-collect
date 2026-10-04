# Demo and QA notes

## Repeatable rehearsal

Reset the demo from the footer before each presentation. The sample auction begins at AED 24,500 with AED 500 increments. The initial Rolex offer is AED 42,000; buyer-offer simulation counters at AED 44,000. Avoid using real personal information.

Use “Use sample details” and “Use demo image” in the seller wizard for a fast walkthrough. The private reference can be `DEMO1234`. The card artwork is Unlimited edition; the listing deliberately uses matching metadata.

Auction controls can disable the automatic competitor, generate a competing bid, move to the final 30 seconds, or close the auction to exercise winner checkout. Transaction controls advance one simulated event at a time. At inspection, either accept the item or open a dispute. Reset to demonstrate the alternative branch.

## Validation coverage

- Unit tests cover concurrent identical bids, duplicate commands, late-bid extensions, auction closure, offer versions, purchase conflicts, inspection constraints, dispute protection and category-form validation.
- Browser journey tests cover the fixed-price path, the auction path and a card listing submission, each at desktop/mobile sizes.
- The production command performs strict TypeScript compilation and Vite bundling.
- The checked-in GitHub checks workflow runs all three checks.

Local verification results and native-browser observations are recorded here at delivery. Run the checks again after modifying the prototype.

## Deliberate limits

Sample data stays in the visitor's browser. No production backend or payment provider is connected. The verification team, automated timeout settlement, buyer/seller identity switching, multi-tab concurrency and dispute resolution are documented architectural concerns, not additional prototype screens.

## Local delivery verification (4 October 2026)

- Strict TypeScript + production build: passed.
- Unit tests: 18 passed across the mock command/state layer and category schemas.
- Formatting check: passed.
- Dependency audit: no reported vulnerabilities at delivery.
- Native browser: fixed-price offer/counter/checkout/payment/timeline/inspection completion verified; bidding/outbid/anti-sniping verified. A fresh compiled preview also verifies the auction-winner checkout path.
- The Playwright journey suite is included for CI/repeatable regression; it was not executed locally. Native in-app browser checks were used for local UI verification.
- Seller browser checks: card-specific fields, verification, media, valuation and submission verified. A mobile watch submission confirms the review screen waits for an explicit submit click after the button-transition fix.
- Mobile home, listing, navigation and seller dashboard checked at 390 × 844. Page width equals viewport width; the wizard's long stepper scrolls within its own container.

## Structure and MUI upgrade verification

- Material UI and icons resolve to 9.4.0; Sass resolves to 1.105.1.
- Feature services, query/mutation hooks and domain types are separated from shared infrastructure. No screen imports `mocks/api`, and the combined Domain component and shared domain hooks/types have been removed.
- SCSS compilation, strict TypeScript production build, all 18 unit tests, formatting and whitespace checks pass. Dependency audit reports zero vulnerabilities.
- Native browser rechecks pass for buyer offer/counter/payment/timeline navigation and auction anti-sniping/winner checkout. Mobile seller submission and overflow are checked at 390 × 844.
- Playwright regression tests remain available for CI; this refactor was verified locally through the native browser and unit/build checks.

## Folder refinement verification

- Hooks and types are individual modules under feature folders; API services, pages, embedded components, schemas and runtime constants have dedicated folders.
- Utilities, providers and app layout have explicit ownership. The root pages folder contains the routed not-found page.
- Feature SCSS and responsive rules moved into their features. A before/after comparison preserves declaration histories for all 461 selector/media combinations.
- Final strict build, 18 unit tests, formatting and whitespace checks pass. Native browser checks cover all eight route screens plus the not-found page; Buy Now, payment and timeline navigation also pass.
- Desktop home and mobile seller layout were visually checked. The mobile page width matches its 390 px viewport, and no browser warnings or errors appeared.

## SCSS modules and mock service split

- Route pages now live exclusively under `src/pages`; every feature has an `index.ts` entry point and a named SCSS module. Feature adapters live in `services/`.
- Feature module scopes also cover portaled dialogs/drawers and alternate confirmation/error states. Global styles are limited to foundations, app layout and shared components.
- Mock implementations are split by feature; `mocks/api.ts` is only a compatibility facade. Persistence, realtime and reservations continue to use one authoritative database.
- Final strict build, formatting and all 18 rule/schema tests pass after the mock split. Native buyer checks cover offer/counter, payment, module-styled confirmation and timeline navigation; fresh-preview auction checks cover extension, closure and winner checkout.
- Mobile card submission passes through all seven wizard steps at 390 × 844; review waits for an explicit submit, and page width matches the viewport. The notification drawer carries its module scope and retains its 380 px styling within the mobile viewport.
