import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { theme } from "./theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
