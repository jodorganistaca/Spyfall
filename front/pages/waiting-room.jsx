import Layout from "../components/Layout";
import React, { useState, useEffect } from "react";
import { Typography, Button, makeStyles, Box } from "@material-ui/core";
import AvatarList from "../components/AvatarList";
import { Router, withTranslation, Redirect } from "../plugins/i18n";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { http } from "../plugins/axios";
import { beginMatch } from "../store/actions/matches";
const useStyles = makeStyles((theme) => ({
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
  waitingTitle: {
    fontFamily: "Raleway",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "1.3rem",
    letterSpacing: "1.25px",
    color: theme.palette.text.primary,
  },
}));

function WaitingRoom({ t, match, isOwner, beginMatch }) {
  const styles = useStyles();
  const [players, setPlayers] = useState([]);
  const listenMatch = (matchId) => {
    const socket = new WebSocket(`ws://localhost:3001?matchId=${matchId}`);
    socket.onmessage = (event) => {
      let players = JSON.parse(event.data).pendingToAssign;
      let waiting = JSON.parse(event.data).waiting;
      if (players) {
        console.log("Players", players);
        setPlayers(players);
      }
      if (!waiting) {
        Router.push("/choose-place");
        socket.close();
      }
    };
  };
  if (!match) {
    return <Redirect to="/" />;
  }

  const loadInitialPlayers = async (matchId) => {
    const res = await http.get(`/matches/${matchId}`);
    setPlayers(res.data.pendingToAssign);
    console.log("Players ->", players);
  };
  useEffect(() => {
    loadInitialPlayers(match._id);
    listenMatch(match._id);
  }, []);
  return (
    <Layout secondary>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="100%"
        alignSelf="stretch"
        alignItems="center"
      >
        <Box marginBottom="50px">
          <Typography variant="subtitle1" align="center">
            {t("match-code")}
          </Typography>
          <Typography align="center" variant="h3" color="primary">
            {match.token}
          </Typography>
        </Box>

        <Typography
          className={styles.waitingTitle}
          align="center"
          variant="caption"
          color="primary"
        >
          {t("waiting")}
        </Typography>

        <AvatarList items={players} />

        {isOwner && (
          <Button
            className={styles.button}
            variant="contained"
            size="medium"
            onClick={() => beginMatch(match._id)}
          >
            {t("next")}
          </Button>
        )}
      </Box>
    </Layout>
  );
}

WaitingRoom.getInitialProps = async () => ({
  namespacesRequired: ["waiting-room"],
});

WaitingRoom.propTypes = {
  match: PropTypes.object.isRequired,
  isOwner: PropTypes.bool.isRequired,
  beginMatch: PropTypes.func.isRequired,
};
const mapStateToProps = (state) => ({
  match: state.matches.match,
  isOwner: state.matches.isOwner,
});

export default withTranslation("waiting-room")(
  connect(mapStateToProps, { beginMatch })(WaitingRoom)
);
