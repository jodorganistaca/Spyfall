import { Router, withTranslation } from "../plugins/i18n";
import { Box, makeStyles, Typography, Button } from "@material-ui/core";
import Layout from "../components/Layout";
import ImageList from "../components/ImageList";
import http from "../plugins/axios";
import { connect } from "react-redux";
import { startMatch } from "../store/actions/matches";

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

const ChoosePlace = function ({ t, match, places, auth, startMatch }) {
  const styles = useStyles();
  const code = match.token;
  const user = auth.user.user;

  const startGame = async (code, user) => {
    try {
      await startMatch(code, user);
      Router.push("/play");
    } catch (error) {
      console.error(error);
    }
  };

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

        <ImageList cellHeight={160} items={places} fieldTitle="name" />
      </Box>

      <Button
        className={styles.button}
        variant="contained"
        size="medium"
        onClick={() => startGame(code, user)}
      >
        {t("start-game")}
      </Button>
    </Layout>
  );
};

ChoosePlace.getInitialProps = async () => {
  let places = [];
  try {
    const response = await http.get("/locations");
    places = response.data;
  } catch (error) {
    console.error(error);
  }
  return {
    namespacesRequired: ["choose-place"],
    places,
  };
};

const mapStateToProps = (state) => ({
  match: state.matches.match,
  auth: state.auth,
});

const mapActionsToProps = {
  startMatch,
};

export default withTranslation("choose-place")(
  connect(mapStateToProps, mapActionsToProps)(ChoosePlace)
);
