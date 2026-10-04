import { useQuery } from "@tanstack/react-query";
import { listingsApi } from "../services";

export const useListings = () =>
  useQuery({ queryKey: ["listings"], queryFn: listingsApi.getListings });
