import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Auction } from "../types/Auction";
import { subscribeToMarketplace } from "../../../shared/realtime/service";

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
