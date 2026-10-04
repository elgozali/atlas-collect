export type Offer = {
  id: string;
  listingId: string;
  buyer: string;
  amount: number;
  status: "pending" | "countered" | "accepted" | "rejected";
  version: number;
  expiresAt: number;
};

export type OfferActionInput = {
  offer: Offer;
  type: "counter" | "accept" | "reject";
  amount?: number;
  actor?: "buyer" | "seller";
};
