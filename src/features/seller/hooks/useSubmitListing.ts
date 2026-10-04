import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitDraft } from "../services";

export function useSubmitListing(onSubmitted: () => void) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: submitDraft,
    onSuccess: () => {
      sessionStorage.removeItem("atlas-draft-v1");
      client.invalidateQueries({ queryKey: ["listings"] });
      onSubmitted();
    },
  });
}
