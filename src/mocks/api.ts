import { seeds } from "./data";
import type {
  Auction,
  Listing,
  MarketplaceEvent,
  Notification,
  Offer,
  Transaction,
} from "../shared/types";
import { transactionSteps } from "../shared/types";
export class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
type Database = {
  listings: Listing[];
  auction: Auction;
  offers: Offer[];
  transactions: Transaction[];
  notifications: Notification[];
  commands: Record<string, unknown>;
};
const initial = (): Database => ({
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
let db: Database = initial();
try {
  const saved = localStorage.getItem("atlas-mock-v1");
  if (saved) db = JSON.parse(saved);
} catch {
  /* Storage can be unavailable in private browsing. */
}
const persist = () => {
  try {
    localStorage.setItem("atlas-mock-v1", JSON.stringify(db));
  } catch {
    /* Demo remains usable in memory. */
  }
};
const clone = <T>(value: T): T => structuredClone(value);
const wait = () => new Promise<void>((r) => setTimeout(r, 350));
const subscribers = new Set<(event: MarketplaceEvent) => void>();
const emit = (type: string, id: string, version: number, auction?: Auction) => {
  const event = {
    eventId: crypto.randomUUID(),
    type,
    entityId: id,
    version,
    occurredAt: Date.now(),
    auction: auction ? clone(auction) : undefined,
  };
  subscribers.forEach((fn) => fn(event));
};
const notify = (title: string, link: string) =>
  db.notifications.unshift({
    id: crypto.randomUUID(),
    title,
    link,
    at: Date.now(),
  });
const listing = (id: string) => {
  const l = db.listings.find((x) => x.id === id);
  if (!l)
    throw new DomainError("NOT_FOUND", "This collectible is unavailable.");
  return l;
};
function commitBid(amount: number, bidder: string) {
  const a = db.auction;
  if (a.status === "closed" || Date.now() >= a.endsAt)
    throw new DomainError("AUCTION_CLOSED", "This auction has ended.");
  if (!Number.isSafeInteger(amount) || amount < a.minimumNextBid)
    throw new DomainError(
      "BID_TOO_LOW",
      `The bid changed. Minimum next bid is AED ${a.minimumNextBid.toLocaleString("en-US")}.`,
    );
  a.currentBid = amount;
  a.minimumNextBid = amount + 500;
  a.highestBidder = bidder;
  a.version++;
  a.serverTime = Date.now();
  if (a.endsAt - Date.now() <= 120000) {
    a.endsAt = Date.now() + 120000;
    a.extended = true;
  }
  a.bids.unshift({ id: crypto.randomUUID(), amount, bidder, at: Date.now() });
  listing(a.listingId).price = amount;
  if (bidder !== "You")
    notify("You have been outbid on Charizard.", "/auctions/charizard");
  persist();
  emit(a.extended ? "AUCTION_EXTENDED" : "BID_ACCEPTED", a.id, a.version, a);
  return clone(a);
}
function reserve(id: string, price: number) {
  const l = listing(id);
  if (l.status !== "active")
    throw new DomainError(
      "LISTING_NO_LONGER_AVAILABLE",
      "This item is already reserved. Open your transaction from notifications.",
    );
  l.status = "reserved";
  const t: Transaction = {
    id: `ATL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    listingId: id,
    listing: clone(l),
    agreedPrice: price,
    step: 0,
    status: "payment_pending",
    events: [{ label: transactionSteps[0], at: Date.now() }],
  };
  db.transactions.unshift(t);
  db.offers
    .filter((o) => o.listingId === id && o.status !== "accepted")
    .forEach((o) => {
      o.status = "rejected";
      o.version++;
    });
  notify("Your purchase is reserved.", `/transactions/${t.id}`);
  persist();
  return clone(t);
}
function settleAuction() {
  const a = db.auction;
  if (a.status === "closed") return clone(a);
  a.status = "closed";
  a.endsAt = Date.now();
  a.version++;
  a.serverTime = Date.now();
  if (a.highestBidder === "You") {
    const t = reserve(a.listingId, a.currentBid);
    a.transactionId = t.id;
    notify("You won the auction. Complete payment.", `/checkout/${t.id}`);
  } else {
    listing(a.listingId).status = "reserved";
  }
  persist();
  emit("AUCTION_CLOSED", a.id, a.version, a);
  return clone(a);
}
export const api = {
  subscribe: (fn: (event: MarketplaceEvent) => void) => {
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  },
  getListings: async () => {
    await wait();
    return clone(db.listings);
  },
  getListing: async (id: string) => {
    await wait();
    return clone(listing(id));
  },
  getAuction: async () => {
    await wait();
    if (db.auction.status === "live" && Date.now() >= db.auction.endsAt) {
      settleAuction();
    }
    return { ...clone(db.auction), serverTime: Date.now() };
  },
  bid: async (amount: number, key: string) => {
    await wait();
    if (db.commands[key]) return clone(db.commands[key] as Auction);
    const a = commitBid(amount, "You");
    db.commands[key] = a;
    persist();
    return a;
  },
  competitor: async () => {
    await wait();
    return commitBid(db.auction.minimumNextBid, "Collector 143");
  },
  closeAuction: async () => {
    await wait();
    return settleAuction();
  },
  finalWindow: async () => {
    await wait();
    if (db.auction.status === "closed")
      throw new DomainError(
        "AUCTION_CLOSED",
        "Reset the demo to replay this auction.",
      );
    db.auction.endsAt = Date.now() + 30000;
    db.auction.extended = false;
    db.auction.version++;
    persist();
    emit("AUCTION_UPDATED", db.auction.id, db.auction.version, db.auction);
    return clone(db.auction);
  },
  purchase: async (id: string, key: string) => {
    await wait();
    if (db.commands[key]) return clone(db.commands[key] as Transaction);
    const t = reserve(id, listing(id).price);
    db.commands[key] = t;
    persist();
    return t;
  },
  getOffers: async () => {
    await wait();
    return clone(db.offers);
  },
  offer: async (id: string, amount: number) => {
    await wait();
    if (listing(id).status !== "active")
      throw new DomainError(
        "LISTING_NO_LONGER_AVAILABLE",
        "This collectible is already reserved.",
      );
    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      amount >= listing(id).price
    )
      throw new DomainError(
        "INVALID_OFFER",
        "Enter an offer below the asking price.",
      );
    const o: Offer = {
      id: crypto.randomUUID(),
      listingId: id,
      buyer: "You",
      amount,
      status: "pending",
      version: 1,
      expiresAt: Date.now() + 86400000,
    };
    db.offers.unshift(o);
    persist();
    return clone(o);
  },
  offerAction: async (
    id: string,
    version: number,
    action: "counter" | "accept" | "reject",
    amount?: number,
    actor: "buyer" | "seller" = "seller",
  ) => {
    await wait();
    const o = db.offers.find((x) => x.id === id);
    if (
      !o ||
      o.version !== version ||
      ["accepted", "rejected"].includes(o.status) ||
      o.expiresAt < Date.now()
    )
      throw new DomainError(
        "OFFER_STATE_CHANGED",
        "This offer changed or expired. Refresh and try again.",
      );
    if (listing(o.listingId).status !== "active")
      throw new DomainError(
        "LISTING_NO_LONGER_AVAILABLE",
        "This collectible is already reserved.",
      );
    if (
      action === "counter" &&
      (!Number.isSafeInteger(amount) || !amount || amount <= 0)
    )
      throw new DomainError("INVALID_OFFER", "Enter a positive whole amount.");
    o.version++;
    if (action === "counter") {
      o.amount = amount!;
      o.status = actor === "buyer" ? "pending" : "countered";
      notify(
        `${actor === "buyer" ? "Buyer" : "Seller"} countered at AED ${amount!.toLocaleString("en-US")}.`,
        `/listings/${o.listingId}`,
      );
      persist();
      return { offer: clone(o) };
    }
    o.status = action === "accept" ? "accepted" : "rejected";
    const transaction =
      action === "accept" ? reserve(o.listingId, o.amount) : undefined;
    persist();
    return { offer: clone(o), transaction };
  },
  getTransaction: async (id: string) => {
    await wait();
    const t = db.transactions.find((x) => x.id === id);
    if (!t)
      throw new DomainError(
        "NOT_FOUND",
        "Start a purchase to create your transaction.",
      );
    return clone(t);
  },
  getTransactions: async () => {
    await wait();
    return clone(db.transactions);
  },
  pay: async (id: string, address: string) => {
    await wait();
    const t = db.transactions.find((x) => x.id === id);
    if (!t) throw new DomainError("NOT_FOUND", "Transaction not found.");
    if (t.status === "payment_pending") {
      t.step = 1;
      t.status = "active";
      t.address = address;
      t.events.push({ label: transactionSteps[1], at: Date.now() });
      notify("Payment secured. Track your collectible.", `/transactions/${id}`);
      persist();
    }
    return clone(t);
  },
  advance: async (id: string) => {
    await wait();
    const t = db.transactions.find((x) => x.id === id);
    if (!t || t.status !== "active" || t.step < 1 || t.step >= 6)
      throw new DomainError(
        "INVALID_TRANSITION",
        "This transaction cannot advance.",
      );
    t.step++;
    if (t.step === 6) t.inspectionEndsAt = Date.now() + 172800000;
    t.events.push({ label: transactionSteps[t.step], at: Date.now() });
    persist();
    return clone(t);
  },
  acceptInspection: async (id: string) => {
    await wait();
    const t = db.transactions.find((x) => x.id === id);
    if (!t || t.step !== 6 || t.status !== "active")
      throw new DomainError(
        "INVALID_TRANSITION",
        "Inspection is not available.",
      );
    t.step = 7;
    t.status = "completed";
    listing(t.listingId).status = "sold";
    t.events.push({ label: transactionSteps[7], at: Date.now() });
    persist();
    return clone(t);
  },
  dispute: async (id: string, reason: string) => {
    await wait();
    const t = db.transactions.find((x) => x.id === id);
    if (!t || t.step !== 6 || t.status !== "active")
      throw new DomainError(
        "INVALID_TRANSITION",
        "You can report an issue during inspection.",
      );
    if (reason.trim().length < 5)
      throw new DomainError("INVALID_REASON", "Tell us what went wrong.");
    t.status = "disputed";
    t.dispute = reason;
    t.events.push({
      label: "Dispute opened; settlement paused",
      at: Date.now(),
    });
    persist();
    return clone(t);
  },
  createListing: async (
    input: Omit<Listing, "id" | "status" | "verified" | "seller">,
  ) => {
    await wait();
    if (!Number.isSafeInteger(input.price) || input.price <= 0)
      throw new DomainError("INVALID_PRICE", "Enter a valid whole price.");
    const l: Listing = {
      ...input,
      id: crypto.randomUUID(),
      status: "review",
      verified: false,
      seller: "Sara M.",
    };
    db.listings.unshift(l);
    notify(
      "Listing submitted. Verification review is pending.",
      `/listings/${l.id}`,
    );
    persist();
    return clone(l);
  },
  getNotifications: async () => {
    await wait();
    return clone(db.notifications);
  },
  reset: () => {
    db = initial();
    persist();
    emit("RESET", "all", 0);
  },
};
