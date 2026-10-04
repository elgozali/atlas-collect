import type { Offer } from "./Offer";

export type OfferActionInput = {
  offer: Offer;
  type: "counter" | "accept" | "reject";
  amount?: number;
  actor?: "buyer" | "seller";
};
