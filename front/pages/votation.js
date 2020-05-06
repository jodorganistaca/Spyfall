import Layout from "../components/Layout";
import {
  Typography,
  Box,
  makeStyles,
  Button,
  Avatar,
  Card,
  CardContent,
} from "@material-ui/core";
import { NavigationSharp } from "@material-ui/icons";
import { withTranslation } from "../plugins/i18n";

import { Router } from "../plugins/i18n";

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
    height: 80,
    flex: "0 0 45%",
  },
});

const Votation = function Votation({ t }) {
  const styles = useStyles();
  const createTable = () => {
    let table = [];
    for (let i = 0; i < 12; i++) {
      table.push(
        <Card className={styles.card}>
          <CardContent>
            <Box display="flex" justifyContent="left" alignItems="center">
              <Box margin="0px 10px 0px 10px">
                <Avatar align="center">H</Avatar>
              </Box>

              <Typography align="center" variant="subtitle1">
                {t("votation")}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }
    return table;
  };
  return (
    <Layout secondary={true}>
      <Box display="flex" flexDirection="column" alignItems="left">
        <Typography
          align="left"
          variant="h4"
          style={{ marginBottom: 40, marginTop: 50, letterSpacing: 1.25 }}
        >
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
      <Box display="flex" flexDirection="row" margin="3% 0px 0px 0px">
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

Votation.getInitialProps = async () => ({
  namespacesRequired: ["votation"],
});

export default withTranslation("votation")(Votation);
