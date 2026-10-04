import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listingsApi } from "./api";
import type { Transaction } from "../transactions/types";

export const useListings = () =>
  useQuery({ queryKey: ["listings"], queryFn: listingsApi.getListings });
export const useListing = (id: string) =>
  useQuery({
    queryKey: ["listing", id],
    queryFn: () => listingsApi.getListing(id),
  });

export function usePurchase(
  id: string,
  onPurchased: (transaction: Transaction) => void,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => listingsApi.purchase(id, crypto.randomUUID()),
    onSuccess: (t) => {
      client.invalidateQueries({ queryKey: ["listing", id] });
      client.invalidateQueries({ queryKey: ["listings"] });
      onPurchased(t);
    },
  });
}
