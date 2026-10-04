import type { Auction } from "../../features/auctions";
import { DomainError } from "../core/errors";
import { database, persistDatabase } from "../core/database";
import { snapshot, simulateLatency } from "../core/response";
import { emitMarketplaceEvent } from "../core/realtime";
import { addNotification } from "../notifications/service";
import { findListing } from "../listings/repository";
import { reserveListing } from "../transactions/reservations";

const BID_INCREMENT_AED = 500;
const ANTI_SNIPING_WINDOW_MS = 2 * 60 * 1000;
const FINAL_DEMO_WINDOW_MS = 30 * 1000;

// Validate and commit synchronously so concurrent bids cannot share the same accepted amount.
function commitBid(amount: number, bidder: string) {
  const auction = database.auction;
  if (auction.status === "closed" || Date.now() >= auction.endsAt) {
    throw new DomainError("AUCTION_CLOSED", "This auction has ended.");
  }
  if (!Number.isSafeInteger(amount) || amount < auction.minimumNextBid) {
    throw new DomainError(
      "BID_TOO_LOW",
      `The bid changed. Minimum next bid is AED ${auction.minimumNextBid.toLocaleString("en-US")}.`,
    );
  }
  auction.currentBid = amount;
  auction.minimumNextBid = amount + BID_INCREMENT_AED;
  auction.highestBidder = bidder;
  auction.version++;
  auction.serverTime = Date.now();
  if (auction.endsAt - Date.now() <= ANTI_SNIPING_WINDOW_MS) {
    auction.endsAt = Date.now() + ANTI_SNIPING_WINDOW_MS;
    auction.extended = true;
  }
  auction.bids.unshift({
    id: crypto.randomUUID(),
    amount,
    bidder,
    at: Date.now(),
  });
  findListing(auction.listingId).price = amount;
  if (bidder !== "You") {
    addNotification(
      "You have been outbid on Charizard.",
      "/auctions/charizard",
    );
  }
  persistDatabase();
  emitMarketplaceEvent(
    auction.extended ? "AUCTION_EXTENDED" : "BID_ACCEPTED",
    auction.id,
    auction.version,
    auction,
  );
  return snapshot(auction);
}

function settleAuction() {
  const auction = database.auction;
  if (auction.status === "closed") {
    return snapshot(auction);
  }
  auction.status = "closed";
  auction.endsAt = Date.now();
  auction.version++;
  auction.serverTime = Date.now();
  if (auction.highestBidder === "You") {
    const transaction = reserveListing(auction.listingId, auction.currentBid);
    auction.transactionId = transaction.id;
    addNotification(
      "You won the auction. Complete payment.",
      `/checkout/${transaction.id}`,
    );
  } else {
    findListing(auction.listingId).status = "reserved";
  }
  persistDatabase();
  emitMarketplaceEvent("AUCTION_CLOSED", auction.id, auction.version, auction);
  return snapshot(auction);
}

export async function getAuction() {
  await simulateLatency();
  if (
    database.auction.status === "live" &&
    Date.now() >= database.auction.endsAt
  ) {
    settleAuction();
  }
  return { ...snapshot(database.auction), serverTime: Date.now() };
}

export async function bid(amount: number, key: string) {
  await simulateLatency();
  if (database.commands[key]) {
    return snapshot(database.commands[key] as Auction);
  }
  const auction = commitBid(amount, "You");
  database.commands[key] = auction;
  persistDatabase();
  return auction;
}

export async function competitor() {
  await simulateLatency();
  return commitBid(database.auction.minimumNextBid, "Collector 143");
}

export async function closeAuction() {
  await simulateLatency();
  return settleAuction();
}

export async function finalWindow() {
  await simulateLatency();
  if (database.auction.status === "closed") {
    throw new DomainError(
      "AUCTION_CLOSED",
      "Reset the demo to replay this auction.",
    );
  }
  database.auction.endsAt = Date.now() + FINAL_DEMO_WINDOW_MS;
  database.auction.extended = false;
  database.auction.version++;
  persistDatabase();
  emitMarketplaceEvent(
    "AUCTION_UPDATED",
    database.auction.id,
    database.auction.version,
    database.auction,
  );
  return snapshot(database.auction);
}

export const mockAuctionsService = {
  getAuction,
  bid,
  competitor,
  closeAuction,
  finalWindow,
};
