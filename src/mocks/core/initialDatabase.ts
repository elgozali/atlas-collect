import { seeds } from "../data";
import type { Database } from "./types";

export const createInitialDatabase = (): Database => ({
  listings: structuredClone(seeds),
  auction: {
    id: "charizard",
    listingId: "charizard",
    currentBid: 24500,
    minimumNextBid: 25000,
    endsAt: Date.now() + 6120000,
    serverTime: Date.now(),
    version: 1,
    highestBidder: "Collector 082",
    status: "live",
    extended: false,
    bids: [
      {
        id: "seed-bid",
        amount: 24500,
        bidder: "Collector 082",
        at: Date.now() - 120000,
      },
    ],
  },
  offers: [
    {
      id: "offer-seed",
      listingId: "rolex",
      buyer: "Omar A.",
      amount: 42000,
      status: "pending",
      version: 1,
      expiresAt: Date.now() + 64800000,
    },
  ],
  transactions: [],
  notifications: [],
  commands: {},
});
