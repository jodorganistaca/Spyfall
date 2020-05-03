import Layout from "../components/Layout";
import {
  Typography,
  Box,
  makeStyles,
  Button,
  IconButton,
  Divider,
} from "@material-ui/core";
import Image from "material-ui-image";
import { Add, PlayArrow } from "@material-ui/icons";
import NextLink from "../components/NextLink";
import FacebookIcon from "../public/assets/facebook.svg";
import GoogleIcon from "../public/assets/google.svg";
import { withTranslation } from "../plugins/i18n";

const useStyles = makeStyles({
  imageContainer: { height: "auto", width: "320px", marginTop: 45 },
  button: {
    borderRadius: "87px",
    margin: "0px 0px 32px 0px",
    width: 300,
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

      <Box display="flex" justifyContent="center" marginBottom="120px" className={styles.imageContainer}>
        <Image src="/assets/logo.png" aspectRatio={1.9} />
        <Image src="/assets/logo.png" aspectRatio={1.9} />
      </Box>

      <Box display="flex" flexDirection="column">
        <Button
          variant="contained"
          size="medium"
          color="secondary"
          className={styles.button}
          startIcon={<Add />}
        >
          {t("next-round")}
        </Button>
      </Box>

      
      <Box
        display="flex"
        justifyContent="center"
        position="relative"
        width="60%"
        margin="30px 0px 30px 0px"
      >
        <Divider variant="fullWidth" style={{ height: 1, width: "100%" }} />
        <Typography variant="caption" className={styles.textDivider}>
          {t("or")}
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="subtitle1"
          style={{ marginBottom: 20, letterSpacing: 1.25 }}
        >
          {t("login-title")}
        </Typography>

        <Box display="flex" justifyContent="center" marginBottom="120px">
          <IconButton aria-label="Google">
            <GoogleIcon className={styles.socialIcon} />
          </IconButton>
          <IconButton aria-label="Facebook">
            <FacebookIcon className={styles.socialIcon} />
          </IconButton>
        </Box>
      </Box>
    </Layout>
  );
};

Winner.getInitialProps = async () => ({
  namespacesRequired: ["winner"],
});

export default withTranslation("winner")(Winner);
