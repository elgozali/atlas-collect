import { createTheme } from "@mui/material/styles";
export const theme = createTheme({
  palette: {
    primary: { main: "#244b40", dark: "#18372e", contrastText: "#fff" },
    secondary: { main: "#8b734c" },
    background: { default: "#f8f7f3", paper: "#fff" },
    text: { primary: "#202723", secondary: "#626962" },
    divider: "#dedfd7",
    success: { main: "#315c46" },
    warning: { main: "#85611a" },
    error: { main: "#a43737" },
  },
  typography: {
    fontFamily: "Manrope, sans-serif",
    h1: { fontWeight: 500, letterSpacing: "-0.045em" },
    h2: { fontWeight: 500, letterSpacing: "-0.035em" },
    h3: { fontWeight: 500, letterSpacing: "-0.025em" },
    h4: { fontWeight: 600, letterSpacing: "-0.025em" },
    button: { textTransform: "none", fontWeight: 650 },
    body1: { lineHeight: 1.7 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 44,
          padding: "10px 22px",
          borderRadius: 6,
          whiteSpace: "nowrap",
        },
      },
    },
    MuiTextField: { defaultProps: { variant: "outlined", fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: { root: { background: "#fff", borderRadius: 6 } },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 5, fontSize: 11, fontWeight: 650 },
      },
    },
    MuiDialog: { styleOverrides: { paper: { padding: 8, borderRadius: 12 } } },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
      styleOverrides: { root: { background: "transparent" } },
    },
  },
});
