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
import { useEffect } from "react";
import { NavigationSharp } from "@material-ui/icons";
import { withTranslation } from "../plugins/i18n";
import { Router } from "../plugins/i18n";
import { connect } from "react-redux";
import confetti from "canvas-confetti";
const useStyles = makeStyles((theme) => ({
  imageContainer: { height: "auto", marginTop: 20 },
  button: {
    width: 160,
    borderRadius: "87px",
    color: "white",
    marginBottom: 50,
    color: theme.palette.getContrastText(theme.palette.success.main),
    backgroundColor: theme.palette.success.main,
    "&:hover": {
      backgroundColor: "#1B7D46",
    },
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

const Winner = function Winner({
  t,
  winnerRole,
  players,
  scoreboard,
  score,
  match,
  winners,
  location,
}) {
  const styles = useStyles();
  useEffect(() => {
    var end = Date.now() + 5 * 1000;

    // go Buckeyes!
    var colors = ["#bb0000", "#ffffff"];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);
  return (
    <Layout>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography
          align="center"
          variant="h2"
          style={{ marginBottom: 40, marginTop: 50, letterSpacing: 1.25 }}
        >
          {t("the") +
            " " +
            `${t(winnerRole === "Spies" ? "Spies" : "Agents")}` +
            " " +
            t("winners")}
        </Typography>
      </Box>

      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
      >
        <Box className={styles.imageContainer}>
          <img
            src={
              winnerRole === "Spies" ? "/assets/spy.png" : "/assets/agent.png"
            }
            width="200px"
          />
        </Box>
      </Box>

      <Box display="flex" flexDirection="row" flexWrap="wrap">
        <Button
          variant="contained"
          size="medium"
          className={styles.button}
          startIcon={<NavigationSharp />}
          onClick={() => Router.push("/")}
        >
          {t("play-again")}
        </Button>
      </Box>

      <Box display="flex" flexDirection="row" width="100%" flexWrap="wrap">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="left"
          margin="0 auto"
          width="50%"
        >
          <Typography align="center" variant="subtitle2">
            {t("users-winners")}
          </Typography>
          <Box
            display="block"
            flexDirection="row"
            width="100%"
            justifyContent="center"
            flexWrap="wrap"
            justifyContent="center"
          >
            <Box
              display="block"
              flexDirection="column"
              alignItems="center"
              flex="auto"
            >
              <Box display="flex" flexDirection="row">
                <Box
                  display="flex"
                  flexDirection="column"
                  margin="auto"
                  width="50%"
                >
                  <Typography align="center" variant="subtitle1">
                    {t("player")}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  width="50%"
                  margin="auto"
                >
                  <Typography align="center" variant="subtitle1" width="50%">
                    {t("score")}
                  </Typography>
                </Box>
              </Box>
              {createWinners(winners)}
            </Box>
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="left"
          margin="0 auto"
          width="50%"
        >
          <Typography align="center" variant="subtitle2">
            {t("secret-place") + ": " + `${location.name}`.toUpperCase()}
          </Typography>
          <Box display="flex" flexDirection="row" margin="auto">
            <Box className={styles.imageContainer}>
              <img src={location.image} width="200px" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

const createWinners = (winners) => {
  let r = [];
  for (let i = 0; winners && i < winners.length; i++) {
    r.push(
      <Box display="flex" flexDirection="row" marginBottom="10px">
        <Box display="flex" flexDirection="column" margin="auto">
          <Box display="flex" textAlign="center" margin="auto">
            <Avatar
              src={`${winners[i].avatar}`}
              alt={`${winners[i].name}`}
            ></Avatar>
            <Typography
              align="center"
              variant="subtitle1"
              style={{ marginLeft: "10px" }}
            >
              {winners[i].name}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" margin="auto">
          <Typography align="center" variant="subtitle1">
            {winners[i].score}
          </Typography>
        </Box>
      </Box>
    );
  }
  return r;
};

const mapStateToProps = (state) => {
  const {
    match,
    players,
    scoreboard,
    score,
    winnerRole,
    winners,
    location,
  } = state.matches;

  return { match, players, scoreboard, score, winnerRole, winners, location };
};

export default withTranslation("winner")(
  connect(mapStateToProps, null)(Winner)
);
