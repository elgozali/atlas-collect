import type { Auction } from "../../features/auctions/types";
import type { Listing } from "../../features/listings/types";
import type { Notification } from "../../features/notifications/types";
import type { Offer } from "../../features/offers/types";
import type { Transaction } from "../../features/transactions/types";

export type Database = {
  listings: Listing[];
  auction: Auction;
  offers: Offer[];
  transactions: Transaction[];
  notifications: Notification[];
  commands: Record<string, unknown>;
};
