import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "../services";

export const useTransactions = () =>
  useQuery({
    queryKey: ["transactions"],
    queryFn: transactionsApi.getTransactions,
  });
