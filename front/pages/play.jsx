import Layout from "../components/Layout";
import { withTranslation } from "../plugins/i18n";
import {
  Box,
  Button,
  makeStyles,
  Typography,
  Grid,
  IconButton,
} from "@material-ui/core";
import { useState, useEffect } from "react";
import moment from "moment/moment";
import ImageList from "../components/ImageList";
import AvatarList from "../components/AvatarList";
import { Help } from "@material-ui/icons";

import CustomTooltip from "../components/CustomTooltip";
import Chat from "../components/Chat";

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
}));

const RoleImage = (props) => {
  const { ...rest } = props;
  (<img width="200px" {...rest} src={`/assets/${rest.role}.png`} />)};

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
  const styles = useStyles();
  let role = "";
  if(match !== null && match.player !== undefined){
    role = match.player.role;
  }
  
  useEffect(() => {
    console.log("useEffect play ", match);
  }, []);
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
      {match.player.role === "Spy" ? (
        <Grid container>
          <Grid item xs>
            <ImageList
              items={Object.values(match.locations)}
              maxWidth="100%"
              maxHeight="600px"
              horizontal
            />
          </Grid>
        </Grid>
      ) : (
        <div>hola</div>
      )}
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
        onClick={() => Router.push("/votation")}
      >
        {t(`Vote`)}
      </Button>
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
