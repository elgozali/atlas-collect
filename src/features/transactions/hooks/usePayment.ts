import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "../api";
import type { CheckoutValues } from "../types";

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
