export type SnackbarSeverity = "success" | "error" | "info" | "warning";

export type SnackbarMessage = {
  id: number;
  message: string;
  severity: SnackbarSeverity;
};
