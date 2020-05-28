import Layout from "../components/Layout";
import { withTranslation } from "../plugins/i18n";
import {
  Box,
  Button,
  makeStyles,
  Typography,
  Grid,
  IconButton,
  GridList,
  GridListTile,
  GridListTileBar,
  TextField,
  Avatar,
  Card,
  CardContent,
  Paper,
  Popover,
} from "@material-ui/core";
import { Send, Image } from "@material-ui/icons";
import { useState, useEffect, useRef, Component } from "react";
import moment from "moment/moment";
import AvatarList from "../components/AvatarList";
import { Help } from "@material-ui/icons";
import { Chat as ChatIcon } from "@material-ui/icons";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import CustomTooltip from "../components/CustomTooltip";
import PerfectScrollbar from "react-perfect-scrollbar";
import RadioButtonUnchecked from "@material-ui/icons/RadioButtonUnchecked";
import CheckCircle from "@material-ui/icons/CheckCircle";
import { Router } from "../plugins/i18n";
import { connect } from "react-redux";
import http from "../plugins/axios";
import { NavigationSharp } from "@material-ui/icons";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { endMatch } from "../store/actions/matches";

const useStyles = makeStyles((theme) => ({
  button: {
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
  rightBar: {
    [theme.breakpoints.up("md")]: {
      textAlign: "end",
      paddingRight: 40,
    },
    [theme.breakpoints.down("sm")]: {
      textAlign: "center",
    },
  },
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    padding: "0px 30px 0px 30px",
    maxHeight: "100%",
    marginTop: "30px",
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  gridList: {
    width: "auto",
    height: "auto",
    padding: "0px 10px 0px 10px",
  },
  icon: { color: theme.palette.success.main },
  itemImage: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  imageContainer: { height: "auto", width: "320px", marginTop: 45 },
  card: {
    margin: "5px 5px 5px 5px",
    width: 250,
    height: "95px",
    flex: "0 0 45%",
  },
  message: {
    backgroundColor: theme.palette.background.paper,
  },
  chatIcon: { color: theme.palette.success.main },
}));

const RoleImage = (props) => {
  const { ...rest } = props;
  <img width="200px" {...rest} src={`/assets/${rest.role}.png`} />;
};

const Countdown = ({ finishTime, t }) => {
  const getTimeLeft = () => {
    const initTime = moment(new Date(finishTime));
    const sub = initTime.subtract(moment(new Date()));

    console.log(finishTime, initTime.hours(), initTime.minutes());
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

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Play = function ({ t, places, match, endMatch }) {
  if (!match) {
    return <Layout></Layout>;
  }
  useEffect(() => {
    if (!match) {
      Router.push("/");
    }
    listenMatch(match.wss);
  }, []);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const styles = useStyles();
  const role = match && match.player ? match.player.role : "";
  const [voted, setVoted] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenAlert(false);
  };

  const listenMatch = (wss) => {
    wss.onmessage = (e) => {
      let method = "";
      const response = JSON.parse(e.data);
      console.log(response);
      method = response.method;
      console.log("no error");
      switch (method) {
        case "END_MATCH":
          endMatch(response);
          break;
        case "CREATE_VOTE":
          if (response.voted == true) {
            setVoted(true);
            setAlertMessage(t("vote-registration"));
            setAlertSeverity("success");
            setOpenAlert(true);
          }
          if (response.error) {
            setVoted(true);
            setAlertMessage(response.error);
            setAlertSeverity("error");
            setOpenAlert(true);
          }
          break;
        case "CHAT":
          let theMessages = response.chat;
          if (theMessages && theMessages.length) {
            theMessages.forEach((element) => {
              if (element.user.id == match.player.user.id) {
                element.sender = "sender";
              } else element.sender = "receiver";
              element.content = element.message;
            });
            theMessages.sort((a, b) => b.date - a.date);
            setMessages(theMessages);
          }
          break;
      }
    };
  };

  const voteForPlace = (idVote) => {
    match.wss.send(
      JSON.stringify({
        method: "CREATE_VOTE",
        token: match.token,
        idVote,
      })
    );
    setTimeout(() => setOpenModal(false), 2000);
  };

  const voteForUser = (selected) => {
    match.wss.send(
      JSON.stringify({
        method: "CREATE_VOTE",
        token: match.token,
        idVote: match.users[selected].id,
      })
    );
    setTimeout(() => setOpenModal(false), 2000);
  };

  return (
    <Layout secondary info={t("info")}>
      <Grid container justify="center" alignItems="center">
        <Grid
          alignItems="center"
          item
          xs={12}
          md={2}
          style={{ paddingLeft: "35px" }}
        >
          {role === "Spy" && match.alsoSpies.length > 0 && (
            <>
              <Typography style={{ marginBottom: "10px" }} variant="subtitle1">
                {t("they-are-spies")}
              </Typography>
              <AvatarList
                items={match.alsoSpies}
                noCounter
                orientation="vertical"
              />
            </>
          )}
        </Grid>

        <Grid item xs={8} style={{ textAlign: "center" }}>
          {role === "Spy" ? (
            <RoleImage style={{ marginBottom: 20 }} role={"spy"} />
          ) : (
            <img width="200px" src={match.location.image} />
          )}
          <Typography color="primary" variant="h4">
            {t(`${role === "Spy" ? "spy-title" : role}`)}
          </Typography>
          <Typography variant="subtitle1">
            {t(`${role === "Spy" ? "spy" : "non-spy"}-description`)}
          </Typography>
        </Grid>
        <Grid xs={12} md={2} item className={styles.rightBar}>
          <Grid container>
            <Grid xs={6} md={12} item>
              <CustomTooltip
                title={t("suggested-questions")}
                aria-label={t("suggested-questions")}
                style={{ fontSize: "0.83rem" }}
              >
                <IconButton color="primary" variant="contained">
                  <Help style={{ width: 30, height: 30 }} />
                </IconButton>
              </CustomTooltip>
            </Grid>

            <Grid xs={6} md={12} item>
              <Chat title={t("chat")} t={t} messages={messages} match={match} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Box style={{ margin: "30px 0px 50px 0px" }}>
        <Typography align="center" variant="subtitle1">
          {t(`time-left`)}
        </Typography>
        <Countdown finishTime={match.endTime} t={t} />
      </Box>
      <Grid container>
        <Grid item xs>
          <ImageList
            items={places}
            maxWidth="100%"
            maxHeight="600px"
            horizontal
          />
        </Grid>
      </Grid>

      <Button
        size="medium"
        variant="contained"
        className={styles.button}
        onClick={() => {
          setOpenModal(true);
        }}
      >
        {t(`${role === "Spy" ? "spy-votation" : "non-spy-votation"}`)}
      </Button>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={styles.modal}
        style={{ outline: "none" }}
        open={openModal}
        onClose={() => setOpenModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openModal}>
          <div className={styles.paper}>
            {match.player.role !== "Spy" ? (
              <>
                <Votation
                  t={t}
                  match={match}
                  voted={voted}
                  setVoted={setVoted}
                  vote={voteForUser}
                />
              </>
            ) : (
              <>
                <ChoosePlace
                  t={t}
                  match={match}
                  voted={voted}
                  setVoted={setVoted}
                  voteForPlace={voteForPlace}
                />
              </>
            )}
          </div>
        </Fade>
      </Modal>
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
};

//#region ChoosePlace
/*
Choose place
 */

const ImageList = function ({
  items = [],
  maxWidth = "auto",
  maxHeight = "auto",
  cellHeight = 80,
  fieldTitle = "name",
  fieldImage = "image",
  selected,
  setSelected,
}) {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <PerfectScrollbar>
        <GridList
          cellHeight={cellHeight}
          className={styles.gridList}
          style={{ maxWidth, maxHeight }}
          cols={4}
        >
          {items.map((tile, index) => (
            <GridListTile
              key={`img_${index}`}
              cols={1}
              onClick={() => {
                setSelected(tile.id);
              }}
              className={styles.itemImage}
            >
              <img
                src={tile[fieldImage]}
                alt={tile[fieldTitle]}
                style={{ opacity: selected === tile.id ? 1 : 0.5 }}
              />
              <GridListTileBar
                actionIcon={
                  <IconButton aria-label={`icon ${tile[fieldTitle]}`}>
                    {selected !== tile.id && (
                      <RadioButtonUnchecked className={styles.icon} />
                    )}
                    {selected === tile.id && (
                      <CheckCircle className={styles.icon} />
                    )}
                  </IconButton>
                }
                title={tile[fieldTitle]}
              />
            </GridListTile>
          ))}
        </GridList>
      </PerfectScrollbar>
    </div>
  );
};

const ChoosePlace = function ({ t, match, voteForPlace, voted }) {
  const styles = useStyles();
  const [selected, setSelected] = useState("");
  let locations = [];
  for (const [key, location] of Object.entries(match.locations)) {
    let tempObj = location;
    tempObj.id = key;
    locations.push(tempObj);
  }

  return (
    <Layout secondary>
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

        <ImageList
          cellHeight={160}
          items={locations}
          fieldTitle="name"
          selected={selected}
          setSelected={setSelected}
        />

        {voted ? (
          <CustomTooltip placement="top" title="You already voted">
            <Box display="flex" flexDirection="row">
              <Button
                variant="contained"
                size="medium"
                disabled={voted}
                className={styles.button}
                onClick={() => voteForPlace(selected)}
              >
                {t("vote")}
              </Button>
            </Box>
          </CustomTooltip>
        ) : (
          <Box display="flex" flexDirection="row">
            <Button
              variant="contained"
              size="medium"
              color="success"
              className={styles.button}
              onClick={() => voteForPlace(selected)}
            >
              {t("vote")}
            </Button>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

//#endregion ChoosePlace

//#region Votation

const Votation = function ({ t, match, vote, voted, setVoted }) {
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState(-1);
  const styles = useStyles();
  const createTable = () => {
    let table = [];
    for (let i = 0; i < players.length; i++) {
      table.push(
        <Card className={styles.card} key={i} onClick={() => setSelected(i)}>
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
                    alt={`${players[i].name}`}
                    src={`${players[i].avatar}`}
                    className={styles.small}
                  ></Avatar>
                </Box>
                <Typography
                  align="center"
                  variant="subtitle1"
                  style={{
                    fontSize: "0.9em",
                    wordBreak: "break-all",
                    maxWidth: "90px",
                  }}
                >
                  {players[i].name}
                </Typography>
              </Box>
            </Button>
            <IconButton aria-label={`icon ${players[i].name}`}>
              {selected !== i && (
                <RadioButtonUnchecked className={styles.icon} />
              )}
              {selected === i && <CheckCircle className={styles.icon} />}
            </IconButton>
          </CardContent>
        </Card>
      );
    }
    return table;
  };
  const getPlayers = async () => {
    setPlayers(match.users);
  };
  useEffect(() => {
    getPlayers();
  }, []);
  return (
    <Layout secondary>
      <Box display="flex" flexDirection="column" alignItems="left">
        <Typography
          align="left"
          variant="h4"
          style={{ marginBottom: 5, marginTop: 50, letterSpacing: 1.25 }}
          onClick={() => console.log(players, "\n match ", match)}
        >
          {t("Vote for a player")}
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
      {voted ? (
        <CustomTooltip placement="top" title="You already voted">
          <Box display="flex" flexDirection="row">
            <Button
              variant="contained"
              size="medium"
              color="success"
              disabled={voted}
              className={styles.button}
              onClick={() => vote(selected)}
            >
              {t("vote")}
            </Button>
          </Box>
        </CustomTooltip>
      ) : (
        <Box display="flex" flexDirection="row">
          <Button
            variant="contained"
            size="medium"
            color="success"
            className={styles.button}
            onClick={() => vote(selected)}
          >
            {t("vote")}
          </Button>
        </Box>
      )}
    </Layout>
  );
};

//#endregion Votation

//#region Chat
const Chat = function ({ title, match, messages, t }) {
  const [anchor, setAnchor] = useState(null);
  const [messageToSend, setMessageToSend] = useState("");
  const inputMessage = useRef(null);

  const setFocus = () => {
    inputMessage.current.focus();
  };

  const sendMessage = (token, chattingUser) => {
    match.wss.send(
      JSON.stringify({
        method: "CHAT",
        token,
        message: messageToSend,
        chattingUser,
      })
    );
    setMessageToSend("");
  };
  const styles = useStyles();

  return (
    <>
      <CustomTooltip
        title={title}
        aria-label={title}
        style={{ fontSize: "0.83rem" }}
      >
        <IconButton
          className={styles.chatIcon}
          variant="contained"
          onClick={(event) => {
            setAnchor(event.currentTarget);
            setFocus();
          }}
        >
          <ChatIcon style={{ width: 30, height: 30 }} />
        </IconButton>
      </CustomTooltip>

      <Popover
        id="simple-menu"
        anchorEl={anchor}
        keepMounted
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        disableAutoFocus
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box justifyContent="space-between" height="100%">
          <Box bgcolor="secondary.light" width="100%" padding="5px">
            <Typography variant="subtitle1" style={{ color: "#fff" }}>
              Chat
            </Typography>
          </Box>

          <Paper
            elevation={1}
            style={{
              maxHeight: "275px",
              minHeight: "200px",
              display: "flex",
              flexDirection: "column-reverse",
              margin: "5px",
              position: "relative",
              overflow: "auto",
            }}
          >
            <PerfectScrollbar
              style={{
                height: "100%",
                minHeight: "200px",
                display: "flex",
                flexDirection: "column-reverse",
                margin: "5px",
              }}
            >
              {messages.map((value, i) => (
                <Message
                  key={i}
                  content={value.content}
                  sender={value.sender}
                  user={value.user}
                />
              ))}
            </PerfectScrollbar>
          </Paper>

          <Box justifyContent="center" alignContent="center" padding="10px">
            <TextField
              style={{ flex: 3, width: "auto" }}
              label={t("write-message")}
              value={messageToSend}
              autoFocus
              ref={inputMessage}
              onChange={(e) => setMessageToSend(e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter")
                  sendMessage(match.token, match.player.user);
              }}
            />
            <IconButton
              onClick={() => {
                return sendMessage(match.token, match.player.user);
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

const Message = ({ content, sender, user, date }) => {
  const styles = useStyles();
  return (
    <Box
      display="flex"
      alignSelf="stretch"
      width="100%"
      justifyContent={sender === "receiver" ? "flex-start" : "flex-end"}
      marginTop="3px"
      marginBottom="3px"
    >
      {sender === "receiver" && (
        <Box>
          <Avatar src={user.avatar} className={styles.small} />
          <p
            style={{
              fontSize: "0.5em",
              textAlign: "center",
              wordBreak: "break-all",
              maxWidth: "55px",
            }}
          >
            {user.name}
          </p>
        </Box>
      )}

      <Box
        margin="0px 10px 0px 10px"
        padding="10px 20px 10px 20px"
        bgcolor={sender === "receiver" ? "primary.main" : "secondary.main"}
        style={{
          borderRadius: "20px",
          borderTopRightRadius: sender !== "receiver" ? "0px" : "20px",
          borderTopLeftRadius: sender === "receiver" ? "0px" : "20px",
          alignSelf: sender === "receiver" ? "flex-start" : "flex-end",
          maxWidth: 220,
          height: "100%",
          wordBreak: "break-word",
        }}
      >
        <Typography
          align={sender == "receiver" ? "start" : "end"}
          variant="caption"
        >
          {content}
        </Typography>
      </Box>
      {sender === "sender" && (
        <Box>
          <Avatar src={user.avatar} className={styles.small} />
          <p
            style={{
              fontSize: "0.8em",
              textAlign: "center",
              margin: "auto",
              wordBreak: "break-all",
              maxWidth: "75px",
            }}
          >
            {user.name}
          </p>
        </Box>
      )}
    </Box>
  );
};

//#endregion Chat
Play.getInitialProps = async () => {
  let places = [];

  return {
    namespacesRequired: ["play"],
    places,
  };
};

const mapStateToProps = (state) => ({ match: state.matches.match });

export default withTranslation("play")(
  connect(mapStateToProps, { endMatch })(Play)
);
