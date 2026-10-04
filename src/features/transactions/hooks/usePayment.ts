import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "../services/transactionsService";
import type { CheckoutValues } from "../types/CheckoutValues";

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
