import { Container, Paper, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Copyright from "./Copyright";
import AppBar from "./AppBar";

const reactStyles = makeStyles({
  paper: {
    margin: "10px",
    padding: "20px",
    height: "100%",
    borderRadius: "10px",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  container: {},
});

export default function Layout(props) {
  const styles = reactStyles();

  const { children, secondary = false } = props;

  return (
    <Box height="100%">
      <Box
        height="33%"
        width="100%"
        position="absolute"
        bgcolor={secondary ? "secondary.light" : "primary.main"}
      />
      <Box
        position="relative"
        padding="30px 0px 50px 0px"
        display="flex"
        minHeight="100%"
      >
        <Container className={styles.container}>
          <Paper elevation={3} className={styles.paper}>
            <AppBar />
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              alignSelf="stretch"
              flex={1}
              {...props}
            >
              {children}
            </Box>
            <Copyright styles={{ alignSelf: "flex-end" }} />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
