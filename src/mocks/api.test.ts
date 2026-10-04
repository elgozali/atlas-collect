import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";
async function resolve<T>(promise: Promise<T>) {
  await vi.advanceTimersByTimeAsync(400);
  return promise;
}
beforeEach(() => {
  vi.useFakeTimers();
  api.reset();
});
describe("Authoritative auction commands", () => {
  it("accepts exactly one of two identical concurrent bids", async () => {
    const results = Promise.allSettled([
      api.bid(25000, "a"),
      api.bid(25000, "b"),
    ]);
    await vi.advanceTimersByTimeAsync(400);
    const r = await results;
    expect(r.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    expect((await resolve(api.getAuction())).currentBid).toBe(25000);
  });
  it("returns the original result when the same command is retried", async () => {
    const first = await resolve(api.bid(25000, "same"));
    const second = await resolve(api.bid(25000, "same"));
    expect(second.bids).toEqual(first.bids);
    expect(second.version).toBe(first.version);
  });
  it("extends a late bid to two minutes and emits only committed state", async () => {
    await resolve(api.finalWindow());
    const events: number[] = [];
    const stop = api.subscribe(
      (e) => e.auction && events.push(e.auction.currentBid),
    );
    const accepted = await resolve(api.bid(25000, "late"));
    expect(accepted.endsAt - Date.now()).toBeGreaterThan(119900);
    expect(accepted.extended).toBe(true);
    expect(events).toEqual([25000]);
    stop();
  });
  it("rejects bids after the authoritative deadline", async () => {
    await resolve(api.finalWindow());
    await vi.advanceTimersByTimeAsync(31000);
    const result = api.bid(25000, "closed").catch((e) => e);
    await vi.advanceTimersByTimeAsync(400);
    expect((await result).code).toBe("AUCTION_CLOSED");
  });
});
describe("Offers and purchase reservations", () => {
  it("prevents buy-now and offer acceptance from selling the same item twice", async () => {
    const o = (await resolve(api.getOffers()))[0];
    const results = Promise.allSettled([
      api.purchase("rolex", "buy"),
      api.offerAction(o.id, o.version, "accept"),
    ]);
    await vi.advanceTimersByTimeAsync(400);
    expect(
      (await results).filter((r) => r.status === "fulfilled"),
    ).toHaveLength(1);
    expect(await resolve(api.getTransactions())).toHaveLength(1);
  });
  it("rejects an action using a stale offer version", async () => {
    const o = (await resolve(api.getOffers()))[0];
    await resolve(api.offerAction(o.id, o.version, "counter", 44000));
    const result = api.offerAction(o.id, o.version, "accept").catch((e) => e);
    await vi.advanceTimersByTimeAsync(400);
    expect((await result).code).toBe("OFFER_STATE_CHANGED");
  });
  it("makes purchase retries idempotent", async () => {
    const a = await resolve(api.purchase("rolex", "purchase"));
    const b = await resolve(api.purchase("rolex", "purchase"));
    expect(a.id).toBe(b.id);
    expect(await resolve(api.getTransactions())).toHaveLength(1);
  });
});
describe("Protected transaction state machine", () => {
  it("prevents fulfilment before payment and completion before inspection", async () => {
    const t = await resolve(api.purchase("rolex", "transaction"));
    const invalid = api.advance(t.id).catch((e) => e);
    await vi.advanceTimersByTimeAsync(400);
    expect((await invalid).code).toBe("INVALID_TRANSITION");
    const complete = api.acceptInspection(t.id).catch((e) => e);
    await vi.advanceTimersByTimeAsync(400);
    expect((await complete).code).toBe("INVALID_TRANSITION");
    await resolve(api.pay(t.id, "Demo address"));
    for (let i = 0; i < 5; i++) await resolve(api.advance(t.id));
    const final = await resolve(api.acceptInspection(t.id));
    expect(final.status).toBe("completed");
    expect((await resolve(api.getListing("rolex"))).status).toBe("sold");
  });
  it("pauses settlement when a dispute is opened during inspection", async () => {
    const t = await resolve(api.purchase("rolex", "dispute"));
    await resolve(api.pay(t.id, "Demo address"));
    for (let i = 0; i < 5; i++) await resolve(api.advance(t.id));
    const disputed = await resolve(api.dispute(t.id, "Missing accessories"));
    expect(disputed.status).toBe("disputed");
    const complete = api.acceptInspection(t.id).catch((e) => e);
    await vi.advanceTimersByTimeAsync(400);
    expect((await complete).code).toBe("INVALID_TRANSITION");
  });
});

describe("Auction settlement and seller publishing", () => {
  it("creates exactly one checkout for the auction winner", async () => {
    await resolve(api.bid(25000, "winner"));
    const closed = await resolve(api.closeAuction());
    expect(closed.status).toBe("closed");
    expect(closed.transactionId).toBeTruthy();
    const second = await resolve(api.closeAuction());
    expect(second.transactionId).toBe(closed.transactionId);
    expect(await resolve(api.getTransactions())).toHaveLength(1);
  });
  it("settles a winning auction when the deadline passes naturally", async () => {
    await resolve(api.finalWindow());
    await resolve(api.bid(25000, "winner"));
    await vi.advanceTimersByTimeAsync(121000);
    const closed = await resolve(api.getAuction());
    expect(closed.status).toBe("closed");
    expect(closed.transactionId).toBeTruthy();
  });
  it("keeps a buyer counter pending until the seller responds", async () => {
    const offer = await resolve(api.offer("rolex", 42000));
    const seller = await resolve(
      api.offerAction(offer.id, offer.version, "counter", 44000),
    );
    const buyer = await resolve(
      api.offerAction(
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
    const source = await resolve(api.getListing("omega"));
    const { id, status, verified, seller, ...input } = source;
    void id;
    void status;
    void verified;
    void seller;
    const listing = await resolve(api.createListing(input));
    expect(listing.status).toBe("review");
    const result = api.purchase(listing.id, "pending-review").catch((e) => e);
    await vi.advanceTimersByTimeAsync(400);
    expect((await result).code).toBe("LISTING_NO_LONGER_AVAILABLE");
  });
});
