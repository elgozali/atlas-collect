import type { Database } from "./types";
import { createInitialDatabase } from "./initialDatabase";
import { emitMarketplaceEvent } from "./realtime";

export let database: Database = createInitialDatabase();

try {
  const saved = localStorage.getItem("atlas-mock-v1");
  if (saved) {
    database = JSON.parse(saved);
  }
} catch {
  /* Storage can be unavailable in private browsing. */
}

export const persistDatabase = () => {
  try {
    localStorage.setItem("atlas-mock-v1", JSON.stringify(database));
  } catch {
    /* Demo remains usable in memory. */
  }
};

export function resetMockDatabase() {
  database = createInitialDatabase();
  persistDatabase();
  emitMarketplaceEvent("RESET", "all", 0);
}
