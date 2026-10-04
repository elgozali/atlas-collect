import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "../services/transactionsService";

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
