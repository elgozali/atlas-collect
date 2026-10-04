import { useQuery } from "@tanstack/react-query";
import { auctionsApi } from "../services/auctionsService";

export const useAuction = (id: string) =>
  useQuery({
    queryKey: ["auction", id],
    queryFn: auctionsApi.getAuction,
    enabled: id === "charizard",
    refetchInterval: 10000,
  });
