import type { Auction } from "../../features/auctions";
import type { MarketplaceEvent } from "../../shared/realtime/types";
import { snapshot } from "./response";

const subscribers = new Set<(event: MarketplaceEvent) => void>();

export const emitMarketplaceEvent = (
  type: string,
  id: string,
  version: number,
  auction?: Auction,
) => {
  const event = {
    eventId: crypto.randomUUID(),
    type,
    entityId: id,
    version,
    occurredAt: Date.now(),
    auction: auction ? snapshot(auction) : undefined,
  };
  subscribers.forEach((listener) => listener(event));
};

export function subscribeToMarketplace(
  listener: (event: MarketplaceEvent) => void,
) {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}
