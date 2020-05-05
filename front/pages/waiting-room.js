import Layout from "../components/Layout";
import { Typography, Button, makeStyles, Box } from "@material-ui/core";
import AvatarList from "../components/AvatarList";
import { Router, withTranslation } from "../plugins/i18n";

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

function WaitingRoom({ t, code = "666666" }) {
  const styles = useStyles();

  return (
    <Layout secondary>
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
            {code}
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
            {
              name: "test1",
              pic:
                "https://static4.abc.es/media/play/2017/09/28/avatar-kVmB--1240x698@abc.jpeg",
            },
          ]}
        />

        <Button
          className={styles.button}
          variant="contained"
          size="medium"
          onClick={() => Router.push("/choose-place")}
        >
          {t("next")}
        </Button>
      </Box>
    </Layout>
  );
}

WaitingRoom.getInitialProps = async () => ({
  namespacesRequired: ["waiting-room"],
});

export default withTranslation("waiting-room")(WaitingRoom);
