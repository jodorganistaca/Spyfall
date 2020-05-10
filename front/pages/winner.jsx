import Layout from "../components/Layout";
import {
  Typography,
  Box,
  makeStyles,
  IconButton,
  Button,
  Avatar,
} from "@material-ui/core";
import Image from "material-ui-image";
import { NavigationSharp } from "@material-ui/icons";
import { withTranslation } from "../plugins/i18n";
import { Router } from "../plugins/i18n";

const useStyles = makeStyles((theme) => ({
  imageContainer: { height: "auto", width: "320px", marginTop: 45 },
  button: {
    borderRadius: "87px",
    width: 220,
    letterSpacing: 1.25,
    padding: "10px 30px 10px 30px",
    borderRadius: "87px",
    color: "white",
    margin: "50px 10px 50px 10px",
    color: theme.palette.getContrastText(theme.palette.error.main),
  },
  button1: {
    width: "auto",
    padding: "10px 30px 10px 30px",
    borderRadius: "87px",
    color: "white",
    marginTop: 50,
    marginBottom: 50,
    color: theme.palette.getContrastText(theme.palette.success.main),
    backgroundColor: theme.palette.success.main,
    "&:hover": {
      backgroundColor: "#1B7D46",
    },
  },
}));

const Winner = function Winner({ t }) {
  const styles = useStyles();
  return (
    <Layout>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography
          align="center"
          variant="h2"
          style={{ marginBottom: 40, marginTop: 50, letterSpacing: 1.25 }}
        >
          {t("title")}
        </Typography>
      </Box>

      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center"> 
        <Box className={styles.imageContainer}>
          <Image src="/assets/logo.png" aspectRatio={1.9} />
        </Box>
        <Box className={styles.imageContainer}>
          <img src="/assets/spy.png" width="200px" />
        </Box>
      </Box>

      <Box display="flex" flexDirection="row">
        <Button
          variant="contained"
          size="medium"
          className={styles.button1}
          startIcon={<NavigationSharp />}
          onClick={() => Router.push("/waiting-room")}
        >
          {t("next-round")}
        </Button>
        <Button
          variant="contained"
          size="medium"
          color="primary"
          className={styles.button}
          startIcon={<NavigationSharp />}
          onClick={() => Router.push("/")}
        >
          {t("finish")}
        </Button>
      </Box>

      <Box display="flex" flexDirection="row">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="left"
          margin="0px 30px 0px 0px"
        >
          <Typography align="left" variant="subtitle2">
            {t("participants")}
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="left"
          margin="0px 30px 0px 0px"
        >
          <Typography align="left" variant="subtitle2">
            {t("secret-place")}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Box display="flex" flexDirection="row" alignItems="center">
            <Avatar>H</Avatar>
            <Typography align="center" variant="subtitle1">
              {t("title")}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center">
            <Avatar>H</Avatar>
            <Typography align="center" variant="subtitle1">
              {t("title")}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Box display="flex" flexDirection="row">
            <Box className={styles.imageContainer}>
              <Image src="/assets/logo.png" aspectRatio={1.9} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

Winner.getInitialProps = async () => ({
  namespacesRequired: ["winner"],
});

export default withTranslation("winner")(Winner);
