import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "../api";

export const useTransactions = () =>
  useQuery({
    queryKey: ["transactions"],
    queryFn: transactionsApi.getTransactions,
  });
