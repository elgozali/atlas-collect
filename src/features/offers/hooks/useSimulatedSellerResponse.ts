import { useQueryClient } from "@tanstack/react-query";
import { offersApi } from "../services/offersService";
import type { Offer } from "../types/Offer";
import { useEffect } from "react";

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
