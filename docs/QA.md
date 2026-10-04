# Demo and testing

Use **Reset demo** in the footer before each walkthrough. All actions use sample data; use placeholder delivery details and identifiers.

## Fixed-price purchase

1. Open the Rolex listing and review its valuation and provenance.
2. Choose **Make an offer** and enter AED 42,000.
3. Accept the simulated seller counteroffer of AED 44,000.
4. Enter delivery details, accept the terms, and simulate payment.
5. Open the transaction timeline and use **Simulate next update** to reach inspection.
6. Accept the item or report an issue. Reset to try the other outcome.

**Buy now** also enters checkout directly at the asking price.

## Live auction

1. Open the Charizard auction. Bidding starts at AED 24,500 with AED 500 increments.
2. Place a bid and use **Simulate competing bid** to see the outbid state.
3. Choose **Jump to final 30 seconds**, then bid again to see the two-minute extension.
4. Turn the automatic competitor off, ensure your bid leads, and choose **Close auction now**.
5. Continue to winner checkout.

## Seller listing

1. Open **Sell** and select a watch or trading card.
2. Use **Use sample details** to populate the category fields.
3. Enter a sample private identifier, such as `DEMO1234`.
4. Use **Use demo image** or upload a JPEG, PNG, or WebP image.
5. Review the valuation, choose sale settings, and continue to review.
6. Submit the listing. It appears in the seller dashboard with verification pending.

The seller dashboard also supports accepting, countering, and rejecting offers.

## Checks

```sh
npm test
npm run build
npm run format:check
npx playwright install chromium
npm run test:e2e
```

Unit tests cover bid concurrency, idempotency, auction extensions and settlement, offer versions, reservations, transaction transitions, disputes, and category validation. Browser tests cover the three journeys at desktop and mobile sizes. The GitHub checks workflow runs the unit tests, build, and browser suite.

For manual checks, also review responsive layouts, keyboard navigation, dialogs, image inspection, and notifications.
