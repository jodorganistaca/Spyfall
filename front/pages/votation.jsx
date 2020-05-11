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

const Votation = function ({
  t,
  role = "spy",
  finishTime = "Mon May 04 2020 07:00:00 GMT-0500",
  match
}) {
  const myInput = useRef();
  const [players, setPlayers] = useState([]);
  const styles = useStyles();
  const vote = async (p) => {
    try {
      console.log(p);
      console.log(players[p]);
      const res = await axios.post(`http://localhost:3001/matches/createVote/${match.token}`,{
        "votedPlayer": players[p]
      });
      console.log(res);
      Router.push("/publish-votation");
    } catch (error) {
      console.error(error);
      return {
        namespacesRequired: ["votation"],
        players: []
      }
    } 
  }
  const createTable = () => {
    let table = [];
    for (let i = 0; i < players.length; i++) {
      table.push(
        <Card className={styles.card}>
          <CardContent>
            <Button onClick={() => vote((i))} key={i}>
              <Box display="flex" justifyContent="left" alignItems="center" flexWrap="wrap">
              <Box margin="0px 10px 0px 10px">
                <Avatar align="center" alt="Travis Howard" src={`${players[i].avatar}`}></Avatar>
              </Box>
              <Typography align="center" variant="subtitle1" inputRef={myInput}>
                {players[i].user.name}
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
    if(match!==null){
      const response = await axios.get(`http://localhost:3001/matches/token/${match.token}`);
      console.log("res ", response)
      const p = response.data["players"];
      if (p) {
        console.log(p);
        setPlayers(p);
      }
    }
  };
  useEffect(() => {
    getPlayers();
  }, []);
  return (
    <Layout secondary={true}>
      <Box display="flex" flexDirection="column" alignItems="left">
        <Typography
          align="left"
          variant="h4"
          style={{ marginBottom: 5, marginTop: 50, letterSpacing: 1.25 }}
          onClick={()=>console.log(players, "\n match " , match)}
        >
          {t("votation")}
        </Typography>
      </Box>
      <Box style={{ marginBottom: 20 }}>
        <Countdown finishTime={finishTime} t={t} />
      </Box>

      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        flexWrap="wrap"
        margin="0px 20% 0px 20%"
      >
        {createTable()}
      </Box>
      <Box display="flex" flexDirection="row">
        <Button
          variant="contained"
          size="medium"
          color="success"
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
    const response = await http.get(`/matches/token/${state.matches.match._id}`);
    const players = response.data["players"];
    console.log(response);
    return {
      namespacesRequired: ["votation"],
      players
    }
  } catch (error) {
    console.error(error);
    return {
      namespacesRequired: ["votation"],
      players: []
    }
  }  
};

Votation.propTypes = {
  match: PropTypes.object,
};

const mapStateToProps = (state) => ({ match: state.matches.match });

export default withTranslation("votation")(
  connect(mapStateToProps,null)(Votation)
);
