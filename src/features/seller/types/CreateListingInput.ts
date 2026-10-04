import type { Listing } from "../../listings";

export type CreateListingInput = Omit<
  Listing,
  "id" | "status" | "verified" | "seller"
>;
