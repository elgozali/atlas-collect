import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offersApi } from "../services";
import type { OfferActionInput } from "../types";
import type { Transaction } from "../../transactions/types";

export function useOfferAction(
  onSuccess: (result: { transaction?: Transaction }) => void,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ offer, type, amount, actor }: OfferActionInput) =>
      offersApi.offerAction(offer.id, offer.version, type, amount, actor),
    onSuccess: (result) => {
      for (const key of ["offers", "listings", "transactions"])
        client.invalidateQueries({ queryKey: [key] });
      onSuccess(result);
    },
  });
}
