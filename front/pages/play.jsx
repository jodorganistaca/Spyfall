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

const RoleImage = (props) => (
  <img width="200px" {...props} src={`/assets/${props.role}.png`} />
);

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

const Play = function ({
  t,
  role = "spy",
  finishTime = "Mon May 04 2020 07:00:00 GMT-0500",
  places,
}) {
  const styles = useStyles();
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
          {role === "spy" && (
            <>
              <Typography style={{ marginBottom: "10px" }} variant="subtitle1">
                {t("they-are-spies")}
              </Typography>
              <AvatarList
                items={[
                  {
                    name: "test1",
                    pic:
                      "https://static4.abc.es/media/play/2017/09/28/avatar-kVmB--1240x698@abc.jpeg",
                  },
                  {
                    name: "test1",
                    pic:
                      "https://static4.abc.es/media/play/2017/09/28/avatar-kVmB--1240x698@abc.jpeg",
                  },
                  {
                    name: "test1",
                    pic:
                      "https://static4.abc.es/media/play/2017/09/28/avatar-kVmB--1240x698@abc.jpeg",
                  },
                ]}
                noCounter
                orientation="vertical"
              />
            </>
          )}
        </Grid>

        <Grid item xs={8} style={{ textAlign: "center" }}>
          <RoleImage style={{ marginBottom: 20 }} role={role} />
          <Typography color="primary" variant="h4">
            {t(`${role}-title`)}
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
                <IconButton color="primary" variant="contained" style={{}}>
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
        <Countdown finishTime={finishTime} t={t} />
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
        onClick={() => Router.push("/votation")}
      >
        {t(`${role}-finish`)}
      </Button>
    </Layout>
  );
};

Play.getInitialProps = async () => {
  let places = [];
  try {
    const response = await http.get("/locations");
    console.log(response);
    places = response.data;
  } catch (error) {
    console.error(error);
  }
  return {
    namespacesRequired: ["play"],
    places,
  };
};

export default withTranslation("play")(Play);
