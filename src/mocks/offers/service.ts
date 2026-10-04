import type { Offer } from "../../features/offers/types";
import { DomainError } from "../core/errors";
import { database, persistDatabase } from "../core/database";
import { snapshot, simulateLatency } from "../core/response";
import { addNotification } from "../notifications/service";
import { findListing } from "../listings/repository";
import { reserveListing } from "../transactions/reservations";

const OFFER_LIFETIME_MS = 24 * 60 * 60 * 1000;

export async function getOffers() {
  await simulateLatency();
  return snapshot(database.offers);
}

export async function offer(id: string, amount: number) {
  await simulateLatency();
  if (findListing(id).status !== "active") {
    throw new DomainError(
      "LISTING_NO_LONGER_AVAILABLE",
      "This collectible is already reserved.",
    );
  }
  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount >= findListing(id).price
  ) {
    throw new DomainError(
      "INVALID_OFFER",
      "Enter an offer below the asking price.",
    );
  }
  const offerRecord: Offer = {
    id: crypto.randomUUID(),
    listingId: id,
    buyer: "You",
    amount,
    status: "pending",
    version: 1,
    expiresAt: Date.now() + OFFER_LIFETIME_MS,
  };
  database.offers.unshift(offerRecord);
  persistDatabase();
  return snapshot(offerRecord);
}

export async function offerAction(
  id: string,
  version: number,
  action: "counter" | "accept" | "reject",
  amount?: number,
  actor: "buyer" | "seller" = "seller",
) {
  await simulateLatency();
  const offerRecord = database.offers.find((record) => record.id === id);
  if (
    !offerRecord ||
    offerRecord.version !== version ||
    ["accepted", "rejected"].includes(offerRecord.status) ||
    offerRecord.expiresAt < Date.now()
  ) {
    throw new DomainError(
      "OFFER_STATE_CHANGED",
      "This offer changed or expired. Refresh and try again.",
    );
  }
  if (findListing(offerRecord.listingId).status !== "active") {
    throw new DomainError(
      "LISTING_NO_LONGER_AVAILABLE",
      "This collectible is already reserved.",
    );
  }
  if (
    action === "counter" &&
    (!Number.isSafeInteger(amount) || !amount || amount <= 0)
  ) {
    throw new DomainError("INVALID_OFFER", "Enter a positive whole amount.");
  }
  offerRecord.version++;
  if (action === "counter") {
    offerRecord.amount = amount!;
    offerRecord.status = actor === "buyer" ? "pending" : "countered";
    addNotification(
      `${actor === "buyer" ? "Buyer" : "Seller"} countered at AED ${amount!.toLocaleString("en-US")}.`,
      `/listings/${offerRecord.listingId}`,
    );
    persistDatabase();
    return { offer: snapshot(offerRecord) };
  }
  offerRecord.status = action === "accept" ? "accepted" : "rejected";
  const transaction =
    action === "accept"
      ? reserveListing(offerRecord.listingId, offerRecord.amount)
      : undefined;
  persistDatabase();
  return { offer: snapshot(offerRecord), transaction };
}

export const mockOffersService = { getOffers, offer, offerAction };
