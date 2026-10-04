import type { Listing } from "../listings/types";

export const transactionSteps = [
  "Purchase confirmed",
  "Payment secured",
  "Received for authentication",
  "Authentication passed",
  "In transit to you",
  "Delivered",
  "48-hour inspection",
  "Complete",
] as const;
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

export type CheckoutValues = {
  name: string;
  address: string;
  city: string;
  consent: boolean;
};
