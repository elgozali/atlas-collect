import { mockSellerService } from "../../../mocks/seller/service";
import { categoryFields } from "../schemas/listingSchema";
import type { Draft, CreateListingInput } from "../types";

export const sellerApi = {
  createListing: (input: CreateListingInput) =>
    mockSellerService.createListing(input),
};

export function submitDraft(d: Draft) {
  const low = d.category === "watches" ? 42500 : 23000;
  const high = d.category === "watches" ? 46000 : 28000;
  const attributes = Object.fromEntries(
    categoryFields[d.category].map((f) => [f.label, d.details[f.key]]),
  );
  if (d.category === "watches")
    attributes["Box & papers"] =
      d.box && d.papers
        ? "Full set"
        : d.box
          ? "Box only"
          : d.papers
            ? "Papers only"
            : "Not included";
  return sellerApi.createListing({
    category: d.category,
    title: `${d.details.brand} ${d.details.model}`,
    subtitle:
      d.category === "watches"
        ? `${d.details.reference} · ${d.details.year}`
        : `${d.details.set} · ${d.details.grader} ${d.details.grade}`,
    brand: d.details.brand,
    condition: d.details.condition || "Graded",
    grade: d.details.grade,
    price: d.price,
    low,
    high,
    image: d.media[0],
    sale: d.sale,
    allowOffers: d.offers,
    reservePrice: d.sale === "auction" ? d.reserve : undefined,
    durationDays: d.sale === "auction" ? Number(d.duration) : undefined,
    attributes,
  });
}
