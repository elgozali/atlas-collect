import { useQuery } from "@tanstack/react-query";
import { offersApi } from "../api";

export const useOffers = () =>
  useQuery({ queryKey: ["offers"], queryFn: offersApi.getOffers });
