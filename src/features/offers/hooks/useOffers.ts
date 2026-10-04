import { useQuery } from "@tanstack/react-query";
import { offersApi } from "../services/offersService";

export const useOffers = () =>
  useQuery({ queryKey: ["offers"], queryFn: offersApi.getOffers });
