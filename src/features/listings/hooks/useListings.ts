import { useQuery } from "@tanstack/react-query";
import { listingsApi } from "../api";

export const useListings = () =>
  useQuery({ queryKey: ["listings"], queryFn: listingsApi.getListings });
