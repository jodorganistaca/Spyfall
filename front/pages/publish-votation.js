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
  Table, 
  TableBody,
  TableHead,
  TableRow,
  withStyles
} from "@material-ui/core";
import MuiTableCell from "@material-ui/core/TableCell";
import { withTranslation, Router } from "../plugins/i18n";

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

const PublishVotation = function PublishVotation({ t }) {
  const styles = useStyles();
  const createTable = () => {
    let table = [];
    for (let i = 0; i < 12; i++) {
      table.push(
        <Card className={styles.card}>
          <CardContent className={styles.cardContent}>
            <Typography align="center" variant="subtitle2">
              {t("votation")}
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Avatar align="center" margin="auto">
                H
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      );
    }
    return table;
  };
  const TableCell = withStyles({
    root: {
      borderBottom: "none"
    }
  })(MuiTableCell);
  return (
    <Layout secondary={true}>
      
      <Box 
        display="flex"
        flexDirection="row"
        width="70%"
      >
        <Typography
          align="center"
          variant="subtitle1"
          margin="0px 20% 0px 20%"
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

      <Divider
        variant="fullWidth"
        style={{ height: 1, width: "80%", margin: "30px 0px 30px 0px" }}
      />

      <Box 
        display="flex"
        flexDirection="row"
        width="70%"
      >
        <Typography align="left" variant="subtitle1">
          {t("results")}
        </Typography>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography align="left" variant="subtitle1">
                {t("player")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography align="center" variant="subtitle1">
                {t("votes")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography align="left" variant="subtitle1">
                {t("player")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography align="center" variant="subtitle1">
                {t("votes")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography align="left" variant="subtitle1">
                {t("player")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography align="center" variant="subtitle1">
                {t("votes")}
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <Box display="flex">
                <Avatar>H</Avatar>
                <Typography align="center" variant="subtitle1" style={{ marginLeft: "10px" }}>
                  {t("title")}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Typography align="center" variant="subtitle1">
                {t("1")}
              </Typography>
            </TableCell>
            <TableCell>
              <Box display="flex">
                <Avatar>H</Avatar>
                <Typography align="center" variant="subtitle1" style={{ marginLeft: "10px" }}>
                  {t("title")}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Typography align="center" variant="subtitle1">
                {t("1")}
              </Typography>
            </TableCell>
            <TableCell>
              <Box display="flex">
                <Avatar>H</Avatar>
                <Typography align="center" variant="subtitle1" style={{ marginLeft: "10px" }}>
                  {t("title")}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Typography align="center" variant="subtitle1">
                {t("1")}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      

      <Button color="primary" onClick={() => Router.push("/winner")}>
        {t("continue")}
      </Button>
    </Layout>
  );
};

PublishVotation.getInitialProps = async () => ({
  namespacesRequired: ["publish-votation"],
});

export default withTranslation("publish-votation")(PublishVotation);
