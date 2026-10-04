import { findListing } from "./repository";
import type { Transaction } from "../../features/transactions";
import { database, persistDatabase } from "../core/database";
import { snapshot, simulateLatency } from "../core/response";
import { reserveListing } from "../transactions/reservations";

export async function getListings() {
  await simulateLatency();
  return snapshot(database.listings);
}

export async function getListing(id: string) {
  await simulateLatency();
  return snapshot(findListing(id));
}

export async function purchase(id: string, key: string) {
  await simulateLatency();
  if (database.commands[key]) {
    return snapshot(database.commands[key] as Transaction);
  }
  const transaction = reserveListing(id, findListing(id).price);
  database.commands[key] = transaction;
  persistDatabase();
  return transaction;
}

export const mockListingsService = { getListings, getListing, purchase };
