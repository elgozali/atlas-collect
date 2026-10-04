import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { showSnackbar } from "../shared/snackbar/service";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => showSnackbar(error.message, "error"),
  }),
  mutationCache: new MutationCache({
    onError: (error) => showSnackbar(error.message, "error"),
    onSuccess: (_, __, ___, mutation) => {
      const message = mutation.meta?.successMessage;
      if (typeof message === "string") showSnackbar(message);
    },
  }),
  defaultOptions: {
    queries: { staleTime: 15000, retry: 1, refetchOnWindowFocus: true },
    mutations: { retry: false },
  },
});
