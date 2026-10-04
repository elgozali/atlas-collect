import { useQuery } from "@tanstack/react-query";
import { api } from "../mocks/api";
export const useListings = () =>
  useQuery({ queryKey: ["listings"], queryFn: api.getListings });
export const useListing = (id: string) =>
  useQuery({ queryKey: ["listing", id], queryFn: () => api.getListing(id) });
export const useOffers = () =>
  useQuery({ queryKey: ["offers"], queryFn: api.getOffers });
export const useTransactions = () =>
  useQuery({ queryKey: ["transactions"], queryFn: api.getTransactions });
export const asset = (name: string) =>
  name.startsWith("data:") ? name : `${import.meta.env.BASE_URL}${name}`;
export const money = (amount: number) =>
  `AED ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)}`;
export const date = (at: number) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dubai",
  }).format(at);
