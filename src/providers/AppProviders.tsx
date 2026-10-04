import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./QueryProvider";
import { RouterProvider } from "./RouterProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <RouterProvider>{children}</RouterProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
