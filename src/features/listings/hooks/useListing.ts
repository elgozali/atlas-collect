import { useQuery } from "@tanstack/react-query";
import { listingsApi } from "../api";

export const useListing = (id: string) =>
  useQuery({
    queryKey: ["listing", id],
    queryFn: () => listingsApi.getListing(id),
  });
