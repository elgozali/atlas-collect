import type { ReactNode } from "react";
import { FeedbackSnackbar } from "../components/FeedbackSnackbar/FeedbackSnackbar";
import { useSnackbarStore } from "../shared/snackbar/store";

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const notification = useSnackbarStore((state) => state.messages[0]);
  const dismiss = useSnackbarStore((state) => state.dismiss);

  return (
    <>
      {children}
      {notification && (
        <FeedbackSnackbar
          key={notification.id}
          notification={notification}
          onExited={() => dismiss(notification.id)}
        />
      )}
    </>
  );
}
