import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { offersApi } from "./api";
import type { OfferActionInput } from "./types";
import type { Transaction } from "../transactions/types";
import type { Offer } from "./types";
import { useEffect } from "react";

export const useOffers = () =>
  useQuery({ queryKey: ["offers"], queryFn: offersApi.getOffers });

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

export function useSimulatedSellerResponse(
  open: boolean,
  current: Offer | undefined,
  askingPrice: number,
) {
  const client = useQueryClient();
  useEffect(() => {
    if (!open || !current || current.status !== "pending") return;
    const timer = setTimeout(() => {
      offersApi
        .offerAction(
          current.id,
          current.version,
          "counter",
          Math.min(
            askingPrice - 500,
            Math.max(
              current.amount,
              Math.round((askingPrice * 0.9565) / 500) * 500,
            ),
          ),
        )
        .then(() => client.invalidateQueries({ queryKey: ["offers"] }))
        .catch(() => client.invalidateQueries({ queryKey: ["offers"] }));
    }, 2200);
    return () => clearTimeout(timer);
  }, [open, current?.id, current?.version, askingPrice, client]);
}
