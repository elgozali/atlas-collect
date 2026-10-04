import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsApi } from "../services/auctionsService";

export function useBid(
  id: string,
  amount: number,
  setAnnouncement: (message: string) => void,
  refetch: () => unknown,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => auctionsApi.bid(amount, crypto.randomUUID()),
    onSuccess: (a) => {
      client.setQueryData(["auction", id], a);
      setAnnouncement("Bid accepted. You are the highest bidder.");
    },
    onError: () => refetch(),
  });
}
