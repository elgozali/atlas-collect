import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsApi } from "./api";
import { useEffect } from "react";
import type { Auction } from "./types";
import { subscribeToMarketplace } from "../../shared/realtime/service";

export const useAuction = (id: string) =>
  useQuery({
    queryKey: ["auction", id],
    queryFn: auctionsApi.getAuction,
    enabled: id === "charizard",
    refetchInterval: 10000,
  });

export function useAuctionEvents(
  id: string,
  setAnnouncement: (message: string) => void,
) {
  const client = useQueryClient();
  useEffect(
    () =>
      subscribeToMarketplace((e) => {
        if (e.entityId !== id || !e.auction) return;
        client.setQueryData<Auction>(["auction", id], (old) =>
          !old || e.version > old.version ? e.auction : old,
        );
        if (e.auction.status === "closed")
          setAnnouncement(
            e.auction.highestBidder === "You"
              ? "Auction won. Your collectible is reserved."
              : "Auction closed. Another collector won.",
          );
        else if (e.auction.highestBidder !== "You")
          setAnnouncement("You have been outbid.");
      }),
    [id, client, setAnnouncement],
  );
}
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
