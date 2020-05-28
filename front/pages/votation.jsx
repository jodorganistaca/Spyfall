import Layout from "../components/Layout";
import {
  Typography,
  TextField,
  Box,
  makeStyles,
  Button,
  Avatar,
  Card,
  CardContent,
} from "@material-ui/core";
import { useState, useEffect, useRef } from "react";
import moment from "moment/moment";
import { NavigationSharp } from "@material-ui/icons";
import { withTranslation } from "../plugins/i18n";

import { Router } from "../plugins/i18n";
import http from "../plugins/axios";
import axios from "axios";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import ChoosePlace from "./choose-place";
const useStyles = makeStyles((theme) => ({
  imageContainer: { height: "auto", width: "320px", marginTop: 45 },
  button: {
    borderRadius: "87px",
    width: 220,
    letterSpacing: 1.25,
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
  card: {
    margin: "5px 5px 5px 5px",
    width: 250,
    height: 80,
    flex: "0 0 45%",
  },
}));

const Countdown = ({ finishTime, t }) => {
  const getTimeLeft = () => {
    const initTime = moment(new Date(finishTime));
    const sub = initTime.subtract(moment(new Date()));
    return sub.valueOf();
  };

  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft());
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    const countdown = setInterval(() => {
      if (timeLeft - 1000 > 0) setTimeLeft((prev) => prev - 1000);
      if (timeLeft <= 10000) setIsFinishing(true);
    }, 1000);

    return () => clearInterval(countdown);
  }, [finishTime, timeLeft]);

  return (
    <Typography
      variant="h4"
      color={isFinishing ? "error" : "textPrimary"}
      align="center"
    >
      {moment(timeLeft).minutes()} {t("minutes")} {moment(timeLeft).seconds()}{" "}
      {t("seconds")}
    </Typography>
  );
};

const Votation = function ({ t, match }) {
  const myInput = useRef();
  const [players, setPlayers] = useState([]);
  const [locations, setLocations] = useState({});
  const styles = useStyles();
  const [hasEnded, setHasEnded] = useState(false);
  const vote = async (p) => {
    console.log(match.users[p]);
    match.wss.send(
      JSON.stringify({
        method: "CREATE_VOTE",
        token: match.token,
        idVote: match.users[p].id,
      })
    );
    match.wss.onmessage = (e) => {
      let method = "";
      const response = JSON.parse(e.data);
      if (!response.error) {
        method = response.method;
        switch (method) {
          case "END_MATCH":
            setHasEnded(true);
            break;
        }
      }
      console.log("chat container", e);
    };
  };
  const createTable = () => {
    let table = [];
    for (let i = 0; i < players.length; i++) {
      table.push(
        <Card className={styles.card} onClick={() => vote(i)}>
          <CardContent>
            <Button key={i}>
              <Box
                display="flex"
                justifyContent="left"
                alignItems="center"
                flexWrap="wrap"
              >
                <Box margin="0px 10px 0px 10px">
                  <Avatar
                    align="center"
                    alt="Travis Howard"
                    src={`${players[i].avatar}`}
                  ></Avatar>
                </Box>
                <Typography
                  align="center"
                  variant="subtitle1"
                  inputRef={myInput}
                >
                  {players[i].name}
                </Typography>
              </Box>
            </Button>
          </CardContent>
        </Card>
      );
    }
    return table;
  };
  const getPlayers = async () => {
    setPlayers(match.users);
    match.locations && setLocations(match.locations);
  };
  useEffect(() => {
    console.log("useEffect votation ", match);
    getPlayers();
  }, []);
  return (
    <Layout secondary={true} info={t("info")}>
      <Box display="flex" flexDirection="column" alignItems="left">
        <Typography
          align="left"
          variant="h4"
          style={{ marginBottom: 5, marginTop: 50, letterSpacing: 1.25 }}
          onClick={() => console.log(players, "\n match ", match)}
        >
          {t("votation")}
        </Typography>
      </Box>
      <Box style={{ marginBottom: 20 }}>
        <Countdown finishTime={match.endTime} t={t} />
      </Box>

      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        flexWrap="wrap"
        margin="0px 20% 0px 20%"
      >
        {match.player.role !== "Spy" ? (
          createTable()
        ) : (
          <>
            {" "}
            <ChoosePlace />
          </>
        )}
      </Box>
      <Box display="flex" flexDirection="row">
        <Button
          variant="contained"
          size="medium"
          color="success"
          disabled={hasEnded}
          className={styles.button}
          startIcon={<NavigationSharp />}
          onClick={() => Router.push("/publish-votation")}
        >
          {t("vote")}
        </Button>
      </Box>
    </Layout>
  );
};

Votation.getInitialProps = async () => {
  try {
    const players = match.users;
    const locations = match.locations;
    const endTime = match.endTime;
    return {
      namespacesRequired: ["votation"],
      players,
      locations,
      endTime,
    };
  } catch (error) {
    console.error(error);
    return {
      namespacesRequired: ["votation"],
      players: [],
      locations: {},
      endTime: undefined,
    };
  }
};

Votation.propTypes = {
  match: PropTypes.object,
};

const mapStateToProps = (state) => ({ match: state.matches.match });

export default withTranslation("votation")(
  connect(mapStateToProps, null)(Votation)
);
