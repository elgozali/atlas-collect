import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offersApi } from "../services/offersService";
import type { Offer } from "../types/Offer";

export function useSubmitOffer(
  listingId: string,
  current: Offer | undefined,
  editing: boolean,
  onSubmitted: () => void,
) {
  const client = useQueryClient();
  return useMutation({
    meta: {
      successMessage:
        current && editing ? "Counteroffer sent." : "Offer sent to the seller.",
    },
    mutationFn: async ({ amount }: { amount: number }) => {
      if (current && editing)
        return (
          await offersApi.offerAction(
            current.id,
            current.version,
            "counter",
            amount,
            "buyer",
          )
        ).offer;
      return offersApi.offer(listingId, amount);
    },
    onSuccess: () => {
      onSubmitted();
      client.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}
