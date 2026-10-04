import { z } from "zod";
import type { Category } from "../../listings/types";
import type { Draft } from "../types";

export const categoryFields: Record<
  Category,
  { key: string; label: string; options?: string[] }[]
> = {
  watches: [
    {
      key: "brand",
      label: "Brand",
      options: ["Rolex", "Omega", "Patek Philippe", "Cartier"],
    },
    { key: "model", label: "Model" },
    { key: "reference", label: "Reference" },
    { key: "year", label: "Year" },
    {
      key: "condition",
      label: "Condition",
      options: ["Excellent", "Good", "Fair"],
    },
    {
      key: "service",
      label: "Service history",
      options: ["No service required", "Service documents included", "Unknown"],
    },
  ],
  cards: [
    {
      key: "brand",
      label: "Franchise",
      options: ["Pokémon", "Sports", "Magic: The Gathering"],
    },
    { key: "model", label: "Card name" },
    { key: "set", label: "Set" },
    { key: "number", label: "Card number" },
    {
      key: "edition",
      label: "Edition",
      options: ["Unlimited", "1st Edition", "Limited"],
    },
    { key: "grader", label: "Grader", options: ["PSA", "BGS", "CGC"] },
    { key: "grade", label: "Grade", options: ["10", "9", "8", "7"] },
  ],
};
export const defaultDraft: Draft = {
  category: "watches",
  details: {
    brand: "",
    model: "",
    reference: "",
    year: "",
    condition: "Excellent",
    service: "Unknown",
  },
  privateReference: "",
  box: true,
  papers: true,
  media: [],
  sale: "fixed",
  price: 46000,
  reserve: 43000,
  duration: "7",
  offers: true,
};
export function draftSchema(category: Category) {
  const details = Object.fromEntries(
    categoryFields[category].map((f) => [
      f.key,
      f.key === "year"
        ? z
            .string()
            .regex(/^(19|20)\d{2}$/, "Enter a four-digit year.")
            .refine((v) => Number(v) <= 2026, "Year cannot be in the future.")
        : z.string().trim().min(1, `${f.label} is required.`),
    ]),
  );
  return z
    .object({
      category: z.enum(["watches", "cards"]),
      details: z.object(details),
      privateReference: z
        .string()
        .trim()
        .min(4, "Enter at least four characters."),
      box: z.boolean(),
      papers: z.boolean(),
      media: z.array(z.string()).min(1, "Add at least one image."),
      sale: z.enum(["fixed", "auction"]),
      price: z.number().int().positive("Enter a positive price."),
      reserve: z.number().int().nonnegative(),
      duration: z.string(),
      offers: z.boolean(),
    })
    .refine((d) => d.sale !== "auction" || d.reserve >= d.price, {
      path: ["reserve"],
      message: "Reserve must be at least the starting bid.",
    });
}
