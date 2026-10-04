export type Category = "watches" | "cards";
export type Listing = {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  brand: string;
  condition: string;
  grade?: string;
  price: number;
  low: number;
  high: number;
  image: string;
  sale: "fixed" | "auction";
  status: "review" | "active" | "reserved" | "sold";
  allowOffers?: boolean;
  reservePrice?: number;
  durationDays?: number;
  verified: boolean;
  attributes: Record<string, string>;
  seller: string;
};
export type Bid = { id: string; amount: number; bidder: string; at: number };
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
export type Offer = {
  id: string;
  listingId: string;
  buyer: string;
  amount: number;
  status: "pending" | "countered" | "accepted" | "rejected";
  version: number;
  expiresAt: number;
};
export const transactionSteps = [
  "Purchase confirmed",
  "Payment secured",
  "Received for authentication",
  "Authentication passed",
  "In transit to you",
  "Delivered",
  "48-hour inspection",
  "Complete",
] as const;
export type Transaction = {
  id: string;
  listingId: string;
  listing: Listing;
  agreedPrice: number;
  step: number;
  status: "payment_pending" | "active" | "disputed" | "completed";
  inspectionEndsAt?: number;
  dispute?: string;
  events: { label: string; at: number }[];
  address?: string;
};
export type Notification = {
  id: string;
  title: string;
  link: string;
  at: number;
};
export type MarketplaceEvent = {
  eventId: string;
  type: string;
  entityId: string;
  version: number;
  occurredAt: number;
  auction?: Auction;
};
