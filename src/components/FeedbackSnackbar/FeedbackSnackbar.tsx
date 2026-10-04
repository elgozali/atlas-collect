import { useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import type { SnackbarMessage } from "../../shared/snackbar/types";
import s from "./FeedbackSnackbar.module.scss";

export function FeedbackSnackbar({
  notification,
  onExited,
}: {
  notification: SnackbarMessage;
  onExited: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Snackbar
      className={s.root}
      open={open}
      autoHideDuration={notification.severity === "error" ? 7000 : 5000}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      onClose={(_, reason) => {
        if (reason !== "clickaway") setOpen(false);
      }}
      slotProps={{ transition: { onExited } }}
    >
      <Alert
        className={s.message}
        variant="filled"
        severity={notification.severity}
        role={notification.severity === "error" ? "alert" : "status"}
        onClose={() => setOpen(false)}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
}
