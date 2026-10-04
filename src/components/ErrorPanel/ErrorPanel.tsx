import s from "./ErrorPanel.module.scss";
import { Alert, Button } from "@mui/material";

export function ErrorPanel({
  error,
  retry,
}: {
  error: Error | null;
  retry?: () => void;
}) {
  return (
    <Alert
      className={s.root}
      severity="error"
      action={retry ? <Button onClick={retry}>Try again</Button> : undefined}
    >
      {error?.message || "We could not load this page."}
    </Alert>
  );
}
