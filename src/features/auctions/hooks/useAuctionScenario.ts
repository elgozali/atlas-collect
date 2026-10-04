import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsApi } from "../services/auctionsService";

export function useAuctionScenario(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (type: "competitor" | "window" | "close") =>
      type === "competitor"
        ? auctionsApi.competitor()
        : type === "close"
          ? auctionsApi.closeAuction()
          : auctionsApi.finalWindow(),
    onSuccess: (a) => client.setQueryData(["auction", id], a),
  });
}
