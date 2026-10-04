import { useMutation, useQueryClient } from "@tanstack/react-query";
import { listingsApi } from "../services/listingsService";
import type { Transaction } from "../../transactions";

export function usePurchase(
  id: string,
  onPurchased: (transaction: Transaction) => void,
) {
  const client = useQueryClient();
  return useMutation({
    meta: { successMessage: "Collectible reserved. Complete your purchase." },
    mutationFn: () => listingsApi.purchase(id, crypto.randomUUID()),
    onSuccess: (t) => {
      client.invalidateQueries({ queryKey: ["listing", id] });
      client.invalidateQueries({ queryKey: ["listings"] });
      onPurchased(t);
    },
  });
}
