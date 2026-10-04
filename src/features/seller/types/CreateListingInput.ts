import type { Listing } from "../../listings/types";

export type CreateListingInput = Omit<
  Listing,
  "id" | "status" | "verified" | "seller"
>;
