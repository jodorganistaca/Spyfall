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
} from "@material-ui/core";
import { useState, useEffect } from "react";
import moment from "moment/moment";
import AvatarList from "../components/AvatarList";
import { Help } from "@material-ui/icons";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import CustomTooltip from "../components/CustomTooltip";
import Chat from "../components/Chat";
import Votation from "./votation";
import PerfectScrollbar from "react-perfect-scrollbar";
import RadioButtonUnchecked from "@material-ui/icons/RadioButtonUnchecked";
import CheckCircle from "@material-ui/icons/CheckCircle";
import { Router } from "../plugins/i18n";
import { connect } from "react-redux";
import http from "../plugins/axios";

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
}));

const RoleImage = (props) => (
  <img width="200px" {...props} src={`/assets/${props.role}.png`} />
);

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

const Play = function ({ t, places, match }) {
  if (!match) {
    console.log("Match not found");
  }
  useEffect(() => {
    listenMatch(match.wss);
  }, []);
  const [openModal, setOpenModal] = useState(false);
  const styles = useStyles();
  const role = match.player.role;
  const [voted, setVoted] = useState(false);

  const listenMatch = (wss) => {
    wss.onmessage = (e) => {
      let method = "";
      const response = JSON.parse(e.data);
      if (!response.error) {
        method = response.method;
        switch (method) {
          case "END_MATCH":
            Router.push("/votation");
            break;
          case "CREATE_VOTE":
            if (response.voted == true) setVoted(true);
            break;
        }
      }
      console.log("chat container", e);
    };
  };

  const voteForPlace = (token, wss, idVote) => {
    wss.send(
      JSON.stringify({
        method: "CREATE_VOTE",
        token: token,
        idVote,
      })
    );
  };

  return (
    <Layout secondary>
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
            <RoleImage style={{ marginBottom: 20 }} role={role} />
          ) : (
            <img width="200px" src={match.location.image} />
          )}
          <Typography color="primary" variant="h4">
            {t(`${role === "Spy" ? role : match.location.name}-title`)}
          </Typography>
          <Typography variant="subtitle1">
            {t(`${role}-description`)}
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
              <Chat title={t("chat")} />
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
        {t(`I know where is everybody!`)}
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
                <Votation />
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
    </Layout>
  );
};

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

const ChoosePlace = function ({ t, match, voteForPlace, voted, setVoted }) {
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
                color="success"
                disabled={voted}
                className={styles.button}
                onClick={() =>
                  voteForPlace(match.token, match.wss, selected, setVoted)
                }
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
              onClick={() =>
                voteForPlace(match.token, match.wss, selected, setVoted)
              }
            >
              {t("vote")}
            </Button>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

Play.getInitialProps = async () => {
  let places = [];

  return {
    namespacesRequired: ["play"],
    places,
  };
};

const mapStateToProps = (state) => ({ match: state.matches.match });

export default withTranslation("play")(
  connect(mapStateToProps, () => ({}))(Play)
);
