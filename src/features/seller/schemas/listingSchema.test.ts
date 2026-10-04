import { describe, it, expect } from "vitest";
import { draftSchema, defaultDraft } from "./listingSchema";
const draft = {
  ...defaultDraft,
  details: {
    brand: "Rolex",
    model: "Submariner",
    reference: "126610LN",
    year: "2022",
    condition: "Excellent",
    service: "Unknown",
  },
  privateReference: "DEMO1234",
  media: ["rolex.jpg"],
};
describe("Category-driven listing validation", () => {
  it("accepts a complete watch draft", () =>
    expect(draftSchema("watches").safeParse(draft).success).toBe(true));
  it("rejects a future watch year", () =>
    expect(
      draftSchema("watches").safeParse({
        ...draft,
        details: { ...draft.details, year: "2027" },
      }).success,
    ).toBe(false));
  it("rejects card drafts without category-specific details", () =>
    expect(
      draftSchema("cards").safeParse({ ...draft, category: "cards" }).success,
    ).toBe(false));
  it("rejects an auction reserve below the starting bid", () =>
    expect(
      draftSchema("watches").safeParse({
        ...draft,
        sale: "auction",
        reserve: 1000,
      }).success,
    ).toBe(false));
  it("requires media and private verification information", () =>
    expect(
      draftSchema("watches").safeParse({
        ...draft,
        media: [],
        privateReference: "",
      }).success,
    ).toBe(false));
});
