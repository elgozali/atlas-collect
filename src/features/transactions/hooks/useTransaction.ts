import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "../services/transactionsService";

export const useTransaction = (id: string) =>
  useQuery({
    queryKey: ["transaction", id],
    queryFn: () => transactionsApi.getTransaction(id),
  });
