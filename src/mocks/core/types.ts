import type { Auction } from "../../features/auctions";
import type { Listing } from "../../features/listings";
import type { Notification } from "../../features/notifications";
import type { Offer } from "../../features/offers";
import type { Transaction } from "../../features/transactions";

export type Database = {
  listings: Listing[];
  auction: Auction;
  offers: Offer[];
  transactions: Transaction[];
  notifications: Notification[];
  commands: Record<string, unknown>;
};
