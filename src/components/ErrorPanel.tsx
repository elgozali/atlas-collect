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
      severity="error"
      action={retry ? <Button onClick={retry}>Try again</Button> : undefined}
    >
      {error?.message || "We could not load this page."}
    </Alert>
  );
}
