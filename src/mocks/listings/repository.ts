import { database } from "../core/database";
import { DomainError } from "../core/errors";

export const findListing = (id: string) => {
  const collectible = database.listings.find((record) => record.id === id);
  if (!collectible) {
    throw new DomainError("NOT_FOUND", "This collectible is unavailable.");
  }
  return collectible;
};
