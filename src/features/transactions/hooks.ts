import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "./api";
import type { CheckoutValues } from "./types";

export const useTransactions = () =>
  useQuery({
    queryKey: ["transactions"],
    queryFn: transactionsApi.getTransactions,
  });
export const useTransaction = (id: string) =>
  useQuery({
    queryKey: ["transaction", id],
    queryFn: () => transactionsApi.getTransaction(id),
  });

export function usePayment(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (v: CheckoutValues) =>
      transactionsApi.pay(id, `${v.name}, ${v.address}, ${v.city}`),
    onSuccess: (t) => {
      client.setQueryData(["transaction", id], t);
      client.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useTransactionAction(
  id: string,
  issue: string,
  onSuccess: () => void,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (type: "advance" | "accept" | "dispute") =>
      type === "advance"
        ? transactionsApi.advance(id)
        : type === "accept"
          ? transactionsApi.acceptInspection(id)
          : transactionsApi.dispute(id, issue),
    onSuccess: (t) => {
      client.setQueryData(["transaction", id], t);
      client.invalidateQueries({ queryKey: ["transactions"] });
      client.invalidateQueries({ queryKey: ["listings"] });
      onSuccess();
    },
  });
}
