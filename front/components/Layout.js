import { Container, Paper, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Copyright from "./Copyright";

export default function Layout({ children, secondary = false }) {
  const styles = reactStyles();

  return (
    <Box height="100%">
      <Box
        height="30%"
        width="100%"
        position="absolute"
        bgcolor={secondary ? "secondary.main" : "primary.main"}
      />
      <Box position="relative" display="flex" height="100%" alignItems="center">
        <Container className={styles.container}>
          <Paper elevation={3} className={styles.paper}>
            {children}

            <Copyright />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

const reactStyles = makeStyles({
  paper: {
    margin: "10px",
    padding: "20px",
    height: "100%",
    borderRadius: "10px",
  },
  container: { minHeight: "80%" },
});
