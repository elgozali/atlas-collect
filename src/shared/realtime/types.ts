import type { Auction } from "../../features/auctions/types";

export type MarketplaceEvent = {
  eventId: string;
  type: string;
  entityId: string;
  version: number;
  occurredAt: number;
  auction?: Auction;
};
