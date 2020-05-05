import { Router, withTranslation } from "../plugins/i18n";
import { Box, makeStyles, Typography, Button } from "@material-ui/core";
import Layout from "../components/Layout";
import ImageList from "../components/ImageList";

const useStyles = makeStyles((theme) => ({
  container: { justifyContent: "space-between" },
  button: {
    width: 160,
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

const ChoosePlace = function ({ t, code = "666666" }) {
  const styles = useStyles();
  return (
    <Layout secondary>
      <Box display="flex" alignItems="flex-end" marginBottom="50px">
        <Typography
          variant="subtitle2"
          align="center"
          style={{ marginRight: 5, marginBottom: 3 }}
        >
          {t("match-code")}
        </Typography>
        <Typography align="center" variant="h6" color="primary">
          {code}
        </Typography>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        alignSelf="stretch"
        alignItems="center"
        justifyContent="center"
        maxHeight="65vh"
        flex={1}
      >
        <Typography align="center" variant="h3" styles={{ marginBottom: 50 }}>
          {t("title")}
        </Typography>

        <ImageList cellHeight={160} />
      </Box>

      <Button
        className={styles.button}
        variant="contained"
        size="medium"
        onClick={() => Router.push("/play")}
      >
        {t("start-game")}
      </Button>
    </Layout>
  );
};

ChoosePlace.getInitialProps = async () => ({
  namespacesRequired: ["choose-place"],
});

export default withTranslation("choose-place")(ChoosePlace);
