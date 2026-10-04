import type { Category, Listing } from "../listings/types";

export type Draft = {
  category: Category;
  details: Record<string, string>;
  privateReference: string;
  box: boolean;
  papers: boolean;
  media: string[];
  sale: "fixed" | "auction";
  price: number;
  reserve: number;
  duration: string;
  offers: boolean;
};
export type CreateListingInput = Omit<
  Listing,
  "id" | "status" | "verified" | "seller"
>;
