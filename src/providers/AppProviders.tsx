import type { ReactNode } from "react";
import { SnackbarProvider } from "./SnackbarProvider";
import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./QueryProvider";
import { RouterProvider } from "./RouterProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SnackbarProvider>
        <QueryProvider>
          <RouterProvider>{children}</RouterProvider>
        </QueryProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
