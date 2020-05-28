import Layout from "../components/Layout";
import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Button,
  makeStyles,
  Box,
  Tooltip,
} from "@material-ui/core";
import AvatarList from "../components/AvatarList";
import { Router, withTranslation, Redirect } from "../plugins/i18n";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import http from "../plugins/axios";
import { beginMatch, beginMatchNonOwner } from "../store/actions/matches";
import CustomTooltip from "../components/CustomTooltip";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
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

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function WaitingRoom({
  t,
  match,
  isOwner,
  beginMatch,
  beginMatchNonOwner,
  wss,
}) {
  const styles = useStyles();
  const [players, setPlayers] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [beganMatch, setBeganMatch] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenAlert(false);
  };
  const listenMatch = () => {
    if (match && match.wss) {
      match.wss.onmessage = (e) => {
        let method = "";
        const response = JSON.parse(e.data);
        method = response.method;
        switch (method) {
          case "JOIN_MATCH":
            if (!response.error) {
              setPlayers(response.waitingUsers);
              setAlertMessage("A user joined to the match!");
              setAlertSeverity("info");
              setOpenAlert(true);
            }
            break;
          case "BEGIN_MATCH":
            return beginMatchNonOwner(response, match.token, match.wss);
            break;
        }
        console.log("waiting room ", e);
      };
    }
  };
  //if (!match) {
  //return <Redirect to="/" />;
  //}

  useEffect(() => {
    if (match && match.wss) {
      listenMatch();
      match.waitingUsers && setPlayers(match.waitingUsers);
    }
  }, [match]);

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
            {match === null ? "" : match.token}
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

        {isOwner ? (
          players.length <= 1 ? (
            <CustomTooltip
              placement="top"
              title="Matches require at least 2 players"
            >
              {/* Span porque así toca https://material-ui.com/es/components/tooltips/ */}
              <span>
                <Button
                  className={styles.button}
                  variant="contained"
                  disabled={players.length <= 1}
                  size="medium"
                  onClick={() => {
                    setBeganMatch(true);
                    beginMatch(match.wss, match.token);
                  }}
                >
                  {t("next")}
                </Button>
              </span>
            </CustomTooltip>
          ) : (
            <>
              <Button
                className={styles.button}
                variant="contained"
                size="medium"
                onClick={() => {
                  setBeganMatch(true);
                  beginMatch(match.wss, match.token);
                }}
              >
                {t("next")}
              </Button>
            </>
          )
        ) : (
          <CustomTooltip
            placement="top"
            title="Only the creator of the match can start it"
          >
            {/* Span porque así toca https://material-ui.com/es/components/tooltips/ */}
            <span>
              <Button
                className={styles.button}
                variant="contained"
                disabled={!isOwner}
                size="medium"
                onClick={() => beginMatch(match.wss, match.token)}
              >
                {t("next")}
              </Button>
            </span>
          </CustomTooltip>
        )}
      </Box>
      <Snackbar
        open={openAlert}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
      >
        <Alert onClose={handleCloseAlert} severity={alertSeverity}>
          {alertMessage}
        </Alert>
      </Snackbar>
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
  connect(mapStateToProps, { beginMatch, beginMatchNonOwner })(WaitingRoom)
);
