import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockAuctionsService } from "./auctions/service";
import { mockListingsService } from "./listings/service";
import { mockOffersService } from "./offers/service";
import { mockSellerService } from "./seller/service";
import { mockTransactionsService } from "./transactions/service";
import { resetMockDatabase } from "./core/database";
import { subscribeToMarketplace } from "./core/realtime";
async function resolve<T>(promise: Promise<T>) {
  await vi.advanceTimersByTimeAsync(400);
  return promise;
}
beforeEach(() => {
  vi.useFakeTimers();
  resetMockDatabase();
});
describe("Authoritative auction commands", () => {
  it("accepts exactly one of two identical concurrent bids", async () => {
    const results = Promise.allSettled([
      mockAuctionsService.bid(25000, "a"),
      mockAuctionsService.bid(25000, "b"),
    ]);
    await vi.advanceTimersByTimeAsync(400);
    const r = await results;
    expect(r.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    expect((await resolve(mockAuctionsService.getAuction())).currentBid).toBe(
      25000,
    );
  });
  it("returns the original result when the same command is retried", async () => {
    const first = await resolve(mockAuctionsService.bid(25000, "same"));
    const second = await resolve(mockAuctionsService.bid(25000, "same"));
    expect(second.bids).toEqual(first.bids);
    expect(second.version).toBe(first.version);
  });
  it("extends a late bid to two minutes and emits only committed state", async () => {
    await resolve(mockAuctionsService.finalWindow());
    const events: number[] = [];
    const stop = subscribeToMarketplace(
      (e) => e.auction && events.push(e.auction.currentBid),
    );
    const accepted = await resolve(mockAuctionsService.bid(25000, "late"));
    expect(accepted.endsAt - Date.now()).toBeGreaterThan(119900);
    expect(accepted.extended).toBe(true);
    expect(events).toEqual([25000]);
    stop();
  });
  it("rejects bids after the authoritative deadline", async () => {
    await resolve(mockAuctionsService.finalWindow());
    await vi.advanceTimersByTimeAsync(31000);
    const result = mockAuctionsService.bid(25000, "closed").catch((e) => e);
    await vi.advanceTimersByTimeAsync(400);
    expect((await result).code).toBe("AUCTION_CLOSED");
  });
});
describe("Offers and purchase reservations", () => {
  it("prevents buy-now and offer acceptance from selling the same item twice", async () => {
    const o = (await resolve(mockOffersService.getOffers()))[0];
    const results = Promise.allSettled([
      mockListingsService.purchase("rolex", "buy"),
      mockOffersService.offerAction(o.id, o.version, "accept"),
    ]);
    await vi.advanceTimersByTimeAsync(400);
    expect(
      (await results).filter((r) => r.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      await resolve(mockTransactionsService.getTransactions()),
    ).toHaveLength(1);
  });
  it("rejects an action using a stale offer version", async () => {
    const o = (await resolve(mockOffersService.getOffers()))[0];
    await resolve(
      mockOffersService.offerAction(o.id, o.version, "counter", 44000),
    );
    const result = mockOffersService
      .offerAction(o.id, o.version, "accept")
      .catch((e) => e);
    await vi.advanceTimersByTimeAsync(400);
    expect((await result).code).toBe("OFFER_STATE_CHANGED");
  });
  it("makes purchase retries idempotent", async () => {
    const a = await resolve(mockListingsService.purchase("rolex", "purchase"));
    const b = await resolve(mockListingsService.purchase("rolex", "purchase"));
    expect(a.id).toBe(b.id);
    expect(
      await resolve(mockTransactionsService.getTransactions()),
    ).toHaveLength(1);
  });
});
describe("Protected transaction state machine", () => {
  it("prevents fulfilment before payment and completion before inspection", async () => {
    const t = await resolve(
      mockListingsService.purchase("rolex", "transaction"),
    );
    const invalid = mockTransactionsService.advance(t.id).catch((e) => e);
    await vi.advanceTimersByTimeAsync(400);
    expect((await invalid).code).toBe("INVALID_TRANSITION");
    const complete = mockTransactionsService
      .acceptInspection(t.id)
      .catch((e) => e);
    await vi.advanceTimersByTimeAsync(400);
    expect((await complete).code).toBe("INVALID_TRANSITION");
    await resolve(mockTransactionsService.pay(t.id, "Demo address"));
    for (let i = 0; i < 5; i++)
      await resolve(mockTransactionsService.advance(t.id));
    const final = await resolve(mockTransactionsService.acceptInspection(t.id));
    expect(final.status).toBe("completed");
    expect(
      (await resolve(mockListingsService.getListing("rolex"))).status,
    ).toBe("sold");
  });
  it("pauses settlement when a dispute is opened during inspection", async () => {
    const t = await resolve(mockListingsService.purchase("rolex", "dispute"));
    await resolve(mockTransactionsService.pay(t.id, "Demo address"));
    for (let i = 0; i < 5; i++)
      await resolve(mockTransactionsService.advance(t.id));
    const disputed = await resolve(
      mockTransactionsService.dispute(t.id, "Missing accessories"),
    );
    expect(disputed.status).toBe("disputed");
    const complete = mockTransactionsService
      .acceptInspection(t.id)
      .catch((e) => e);
    await vi.advanceTimersByTimeAsync(400);
    expect((await complete).code).toBe("INVALID_TRANSITION");
  });
});

describe("Auction settlement and seller publishing", () => {
  it("creates exactly one checkout for the auction winner", async () => {
    await resolve(mockAuctionsService.bid(25000, "winner"));
    const closed = await resolve(mockAuctionsService.closeAuction());
    expect(closed.status).toBe("closed");
    expect(closed.transactionId).toBeTruthy();
    const second = await resolve(mockAuctionsService.closeAuction());
    expect(second.transactionId).toBe(closed.transactionId);
    expect(
      await resolve(mockTransactionsService.getTransactions()),
    ).toHaveLength(1);
  });
  it("settles a winning auction when the deadline passes naturally", async () => {
    await resolve(mockAuctionsService.finalWindow());
    await resolve(mockAuctionsService.bid(25000, "winner"));
    await vi.advanceTimersByTimeAsync(121000);
    const closed = await resolve(mockAuctionsService.getAuction());
    expect(closed.status).toBe("closed");
    expect(closed.transactionId).toBeTruthy();
  });
  it("keeps a buyer counter pending until the seller responds", async () => {
    const offer = await resolve(mockOffersService.offer("rolex", 42000));
    const seller = await resolve(
      mockOffersService.offerAction(offer.id, offer.version, "counter", 44000),
    );
    const buyer = await resolve(
      mockOffersService.offerAction(
        offer.id,
        seller.offer.version,
        "counter",
        43500,
        "buyer",
      ),
    );
    expect(buyer.offer.status).toBe("pending");
  });
  it("blocks purchasing an unverified seller submission", async () => {
    const source = await resolve(mockListingsService.getListing("omega"));
    const { id, status, verified, seller, ...input } = source;
    void id;
    void status;
    void verified;
    void seller;
    const listing = await resolve(mockSellerService.createListing(input));
    expect(listing.status).toBe("review");
    const result = mockListingsService
      .purchase(listing.id, "pending-review")
      .catch((e) => e);
    await vi.advanceTimersByTimeAsync(400);
    expect((await result).code).toBe("LISTING_NO_LONGER_AVAILABLE");
  });
});
