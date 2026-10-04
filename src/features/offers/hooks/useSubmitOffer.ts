import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offersApi } from "../api";
import type { Offer } from "../types";

export function useSubmitOffer(
  listingId: string,
  current: Offer | undefined,
  editing: boolean,
  onSubmitted: () => void,
) {
  const client = useQueryClient();
  return useMutation({
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
