import type { Listing } from "../../features/listings/types";
import { DomainError } from "../core/errors";
import { database, persistDatabase } from "../core/database";
import { snapshot, simulateLatency } from "../core/response";
import { addNotification } from "../notifications/service";

export async function createListing(
  input: Omit<Listing, "id" | "status" | "verified" | "seller">,
) {
  await simulateLatency();
  if (!Number.isSafeInteger(input.price) || input.price <= 0) {
    throw new DomainError("INVALID_PRICE", "Enter a valid whole price.");
  }
  const collectible: Listing = {
    ...input,
    id: crypto.randomUUID(),
    status: "review",
    verified: false,
    seller: "Sara M.",
  };
  database.listings.unshift(collectible);
  addNotification(
    "Listing submitted. Verification review is pending.",
    `/listings/${collectible.id}`,
  );
  persistDatabase();
  return snapshot(collectible);
}

export const mockSellerService = { createListing };
