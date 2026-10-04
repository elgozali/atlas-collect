import { useSnackbarStore } from "./store";
import type { SnackbarSeverity } from "./types";

export function showSnackbar(
  message: string,
  severity: SnackbarSeverity = "success",
) {
  useSnackbarStore.getState().enqueue(message, severity);
}
