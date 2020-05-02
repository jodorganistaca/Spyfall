import { createMuiTheme } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";

export default createMuiTheme({
  palette: {
    primary: {
      main: "#BE3F2A",
    },
    secondary: {
      main: "#2A3949",
    },
    // accent: {
    //   main: "#219653",
    // },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fff",
    },
  },
  typography: {
    fontFamily: ["'Lato', sans-serif"].join(","),
    h1: { fontFamily: ["'Raleway', sans-serif"].join(",") },
    h2: { fontFamily: ["'Raleway', sans-serif"].join(",") },
    h3: { fontFamily: ["'Raleway', sans-serif"].join(",") },
    h4: { fontFamily: ["'Raleway', sans-serif"].join(",") },
  },
});