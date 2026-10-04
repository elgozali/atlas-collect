import type { Listing } from "../../listings/types";

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
