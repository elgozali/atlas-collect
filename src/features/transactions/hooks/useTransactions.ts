import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "../services/transactionsService";

export const useTransactions = () =>
  useQuery({
    queryKey: ["transactions"],
    queryFn: transactionsApi.getTransactions,
  });
