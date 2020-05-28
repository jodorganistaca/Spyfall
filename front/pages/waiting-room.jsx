import Layout from "../components/Layout";
import React, { useState, useEffect, useRef } from "react";
import { Typography, Button, makeStyles, Box } from "@material-ui/core";
import AvatarList from "../components/AvatarList";
import { Router, withTranslation, Redirect } from "../plugins/i18n";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import http from "../plugins/axios";
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

function WaitingRoom({ t, match, isOwner, beginMatch, wss }) {
  const styles = useStyles();
  const [players, setPlayers] = useState([]);
  const listenMatch = () => {
    
    match.wss.onmessage = (e) => {
      let method = "";
      const response = JSON.parse(e.data);
      method = response.method;
      switch(method){
        case "JOIN_MATCH":
          setPlayers(response.waitingUsers);
          break;
        case "BEGIN_MATCH":

          break;
      }
      console.log("waiting room ", e);

    }
    console.log(match);
    console.log(match !== null);
    if(match !== null && match.waitingUsers !== undefined ){
      console.log(match.waitingUsers)
      setPlayers(match.waitingUsers);
    }
    
  };
  //if (!match) {
    //return <Redirect to="/" />;
  //}

  const loadInitialPlayers = async (matchId) => {
    const res = await http.get(`/matches/${matchId}`);
    setPlayers(res.data.pendingToAssign);
    console.log("Players ->", players);
  };

  if(match && match.wss){
    match.wss.onmessage = (e) => {
      let method = "";
      const response = JSON.parse(e.data);
      method = response.method;
      switch(method){
        case "JOIN_MATCH":
          setPlayers(response.waitingUsers);
          break;
        case "MATCH_CREATION":
          setPlayers(response.waitingUsers);
          break;
      }

    }
  }

  useEffect(() => {
    
    if(match && match.wss){
      listenMatch();
      console.log("web socket waiting room ",match.wss)
    }
  }, []);

  return (
    <Layout secondary info={t("info")}>
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
            { match === null ? "" : match.token }
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

        {(true || isOwner) && (
          <Button
            className={styles.button}
            variant="contained"
            size="medium"
            onClick={() => beginMatch(match.wss, match.token)}
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

// WaitingRoom.propTypes = {
//   match: PropTypes.object.isRequired,
//   isOwner: PropTypes.bool.isRequired,
//   beginMatch: PropTypes.func.isRequired,
// };

const mapStateToProps = (state) => ({
  match: state.matches.match,
  isOwner: state.matches.isOwner,
});

export default withTranslation("waiting-room")(
  connect(mapStateToProps, { beginMatch })(WaitingRoom)
);
