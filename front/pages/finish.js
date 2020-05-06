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

const useStyles = makeStyles({
  imageContainer: { height: "auto", width: "320px", marginTop: 45 },
  button: {
    borderRadius: "87px",
    margin: "0px 0px 32px 10px",
    width: 220,
    letterSpacing: 1.25,
  },
  socialIcon: {
    borderRadius: "50%",
    boxShadow:
      "0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)",
  },
  textDivider: {
    position: "absolute",
    margin: "auto",
    backgroundColor: "#fff",
    padding: "4px 10px 4px 10px",
    top: "-13px",
  },
});

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

      <Box display="flex" flexDirection="row">
        <Box className={styles.imageContainer}>
          <Image src="/assets/logo.png" aspectRatio={1.9} />
        </Box>
        <Box className={styles.imageContainer}>
          <Image src="/assets/spy.png" aspectRatio={1} />
        </Box>
      </Box>

      <Box display="flex" flexDirection="row">
        <Button
          variant="contained"
          size="medium"
          color="success"
          className={styles.button}
          startIcon={<NavigationSharp />}
          onClick={() => Router.push("/waiting-room")}
        >
          {t("next-round")}
        </Button>
        <Button
          variant="contained"
          size="medium"
          color="error"
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
