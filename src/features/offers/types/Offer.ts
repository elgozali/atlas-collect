export type Offer = {
  id: string;
  listingId: string;
  buyer: string;
  amount: number;
  status: "pending" | "countered" | "accepted" | "rejected";
  version: number;
  expiresAt: number;
};
