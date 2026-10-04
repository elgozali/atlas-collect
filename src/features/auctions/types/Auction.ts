import type { Bid } from "./Bid";

export type Auction = {
  id: string;
  listingId: string;
  currentBid: number;
  minimumNextBid: number;
  endsAt: number;
  serverTime: number;
  version: number;
  highestBidder: string;
  status: "live" | "closed";
  extended: boolean;
  transactionId?: string;
  bids: Bid[];
};
