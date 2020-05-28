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

const useStyles = makeStyles((theme) => ({
  imageContainer: { height: "auto", width: "320px", marginTop: 45 },
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
}));

const PublishVotation = ({
  t,
  match,
  players,
  scoreboard,
  score,
  winnerRole,
}) => {
  const styles = useStyles();
  console.log("props", players);
  const createTable = () => {
    let table = [];

    for (let i = 0; i < players.length; i++) {
      table.push(
        <Card key={i} className={styles.card}>
          <CardContent className={styles.cardContent}>
            <Typography align="center" variant="subtitle2">
              {players[i].user.name}
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Avatar
                align="center"
                margin="auto"
                alt={`${players[i].user.name}`}
                src={`${players[i].user.avatar}`}
              ></Avatar>
            </Box>
          </CardContent>
        </Card>
      );
    }
    return table;
  };
  const createResults = () => {
    let r = [];
    for (let i = 0; i < players.length; i++) {
      r.push(
        <Box display="flex" flexDirection="row" marginBottom="10px">
          <Box display="flex" flexDirection="column" width="33%" margin="auto">
            <Box display="flex" textAlign="center" margin="auto">
              <Avatar
                src={`${players[i].user.avatar}`}
                alt={`${players[i].user.name}`}
              ></Avatar>
              <Typography
                align="center"
                variant="subtitle1"
                style={{ marginLeft: "10px" }}
              >
                {players[i].user.name}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" width="33%" margin="auto">
            <Typography align="center" variant="subtitle1">
              {players[i].role}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" width="33%" margin="auto">
            <Typography align="center" variant="subtitle1">
              {players[i].votes}
            </Typography>
          </Box>
        </Box>
      );
    }
    return r;
  };

  return (
    <Layout secondary={true} info={t("info")}>
      <Box display="flex" flexDirection="row" width="70%">
        <Typography align="left" variant="subtitle1">
          {t("results")}
        </Typography>
      </Box>

      <Divider
        variant="fullWidth"
        style={{ height: 1, width: "80%", margin: "30px 0px 30px 0px" }}
      />
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
              width="33%"
              margin="auto"
            >
              <Typography align="center" variant="subtitle1">
                {t("player")}
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              width="33%"
              margin="auto"
            >
              <Typography align="center" variant="subtitle1">
                {t("role")}
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              width="33%"
              margin="auto"
            >
              <Typography align="center" variant="subtitle1">
                {t("votes")}
              </Typography>
            </Box>
          </Box>
          {createResults()}
        </Box>
      </Box>
      <Button
        className={styles.button}
        variant="contained"
        disabled={players.length <= 1}
        size="medium"
        onClick={() => Router.push("/winner")}
      >
        {t("continue")}
      </Button>
    </Layout>
  );
};

PublishVotation.propTypes = {
  match: PropTypes.object,
};

const mapStateToProps = (state) => {
  const { match, players, scoreboard, score, winnerRole } = state.matches;

  return { match, players, scoreboard, score, winnerRole };
};

export default withTranslation("publish-votation")(
  connect(mapStateToProps, null)(PublishVotation)
);
