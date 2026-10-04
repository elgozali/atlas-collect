import type { Transaction } from "../../features/transactions";
import { transactionSteps } from "../../features/transactions";
import { DomainError } from "../core/errors";
import { database, persistDatabase } from "../core/database";
import { snapshot } from "../core/response";
import { addNotification } from "../notifications/service";
import { findListing } from "../listings/repository";

// Keep the reservation synchronous: purchases, accepted offers and auction winners reserve once.
export function reserveListing(id: string, price: number) {
  const collectible = findListing(id);
  if (collectible.status !== "active") {
    throw new DomainError(
      "LISTING_NO_LONGER_AVAILABLE",
      "This item is already reserved. Open your transaction from notifications.",
    );
  }
  collectible.status = "reserved";
  const transaction: Transaction = {
    id: `ATL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    listingId: id,
    listing: snapshot(collectible),
    agreedPrice: price,
    step: 0,
    status: "payment_pending",
    events: [{ label: transactionSteps[0], at: Date.now() }],
  };
  database.transactions.unshift(transaction);
  database.offers
    .filter(
      (offerRecord) =>
        offerRecord.listingId === id && offerRecord.status !== "accepted",
    )
    .forEach((offerRecord) => {
      offerRecord.status = "rejected";
      offerRecord.version++;
    });
  addNotification(
    "Your purchase is reserved.",
    `/transactions/${transaction.id}`,
  );
  persistDatabase();
  return snapshot(transaction);
}
