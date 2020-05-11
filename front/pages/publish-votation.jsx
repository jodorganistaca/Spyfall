import Layout from "../components/Layout";
import {
  Typography,
  Box,
  makeStyles,
  Divider,
  Avatar,
  Card,
  CardContent,
  Button,
} from "@material-ui/core";
import { useState, useEffect, useRef } from "react";
import { withTranslation, Router } from "../plugins/i18n";
import http from "../plugins/axios";
import axios from "axios";
import { connect } from "react-redux";
import PropTypes from "prop-types";

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
  card: {
    margin: "5px 5px 5px 5px",
    width: 150,
    height: 110,
    flex: "0 0 15%",
  },
  header: {
    flex: "0 0 33%",
    margin: "0px 10% 0px 0%",
  },
});

const PublishVotation = function PublishVotation({ 
  t,
  data,
  match
}) {
  const styles = useStyles();
  const [players, setPlayers] = useState([]);
  const [votes, setVotes] = useState([]);
  const createTable = () => {
    let table = [];
  
    for (let i = 0; i < players.length; i++) {
      table.push(
        <Card className={styles.card}>
          <CardContent className={styles.cardContent}>
            <Typography align="center" variant="subtitle2">
              {players[i].user.name}
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Avatar align="center" margin="auto" src={`${players[i].user.avatar}`}>
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      );
    }
    return table;
  };
  const createResults = () => {
    let r = [];
    for(let i = 0; i < players.length; i++){
      r.push(          
          <Box display="flex" flexDirection="row">
            <Box display="flex" flexDirection="column" marginLeft="5%">
              <Box display="flex">
                <Avatar align="center" margin="auto" src={`${players[i].user.avatar}`}></Avatar>
                <Typography
                  align="center"
                  variant="subtitle1"
                  style={{ marginLeft: "10px" }}
                >
                  {players[i].user.name}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" marginLeft="48%">
              {
                players[i].votes === null ?
                <Typography align="center" variant="subtitle1">
                  {t("0")}
                </Typography>
                :
                <Typography align="center" variant="subtitle1">
                  {players[i].votes}
                </Typography>
              }
              
            </Box>
          </Box>
      );
    }
    return r;
  }
  const countVotes = () =>{
    let max = 0;
    let player;
    for(let p of players){
      if(p.votes !== undefined){
        console.log(p.votes);
        if(p.votes > max){
          max = p.votes;
          player = p;
        }
      }
    }
    if(player.role === "Spy"){
      console.log(player);
      return Router.push("/winner");
    }else{
      return Router.push("/winner")
    }
  }
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
      <Box display="flex" flexDirection="row" width="70%">
        <Typography align="center" variant="subtitle1" margin="0px 20% 0px 20%">
          {t("votation")}
        </Typography>
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

      <Divider
        variant="fullWidth"
        style={{ height: 1, width: "80%", margin: "30px 0px 30px 0px" }}
      />

      <Box display="flex" flexDirection="row" width="70%">
        <Typography align="left" variant="subtitle1">
          {t("results")}
        </Typography>
      </Box>

      <Box display="flex" flexDirection="row" width="100%" justifyContent="center" flexWrap="wrap" justifyContent="center">
        <Box display="flex" flexDirection="column" alignItems="left" flex="0 0 34%">
        <Box display="flex" flexDirection="row">
          <Box display="flex" flexDirection="column" marginLeft="5%">
              <Typography align="left" variant="subtitle1">
                {t("player")}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" marginLeft="48%">
              <Typography align="center" variant="subtitle1">
                {t("votes")}
              </Typography>
            </Box>
          </Box>
          {createResults()}       
        </Box> 
      </Box>

      <Button color="primary" onClick={() => countVotes()}>
        {t("continue")}
      </Button>
    </Layout>
  );
};

PublishVotation.getInitialProps = async () => {
  try {
    const response = await http.get("/matches/token/39bfbcd0-92be-11ea-9598-7be414cf025f");
    const data = response.data;
    return {
      namespacesRequired: ["publish-votation"],
      data
    }
  } catch (error) {
    console.error(error);
    return {
      namespacesRequired: ["publish-votation"],
      players: []
    }
  }  
};

PublishVotation.propTypes = {
  match: PropTypes.object,
};

const mapStateToProps = (state) => ({ match: state.matches.match });

export default withTranslation("publish-votation")(
  connect(mapStateToProps,null)(PublishVotation)
);
