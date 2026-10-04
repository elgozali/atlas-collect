import type { Category } from "./Category";

export type Listing = {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  brand: string;
  condition: string;
  grade?: string;
  price: number;
  low: number;
  high: number;
  image: string;
  sale: "fixed" | "auction";
  status: "review" | "active" | "reserved" | "sold";
  allowOffers?: boolean;
  reservePrice?: number;
  durationDays?: number;
  verified: boolean;
  attributes: Record<string, string>;
  seller: string;
};
