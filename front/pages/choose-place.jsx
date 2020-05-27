import { Router, withTranslation } from "../plugins/i18n";
import { Box, makeStyles, Typography, Button } from "@material-ui/core";
import Layout from "../components/Layout";
import http from "../plugins/axios";
import { connect } from "react-redux";
import { useState, useEffect } from "react";
import {
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
} from "@material-ui/core";
import PerfectScrollbar from "react-perfect-scrollbar";
import RadioButtonUnchecked from "@material-ui/icons/RadioButtonUnchecked";
import CheckCircle from "@material-ui/icons/CheckCircle";
import CustomTooltip from "../components/CustomTooltip";
const useStyles = makeStyles((theme) => ({
  container: { justifyContent: "space-between" },
  button: {
    width: 160,
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

const ChoosePlace = function ({ t, match, auth }) {
  const styles = useStyles();
  const wss = match.wss;
  const [selected, setSelected] = useState("");
  const [voted, setVoted] = useState(false);
  let locations = [];
  for (const [key, location] of Object.entries(match.locations)) {
    let tempObj = location;
    tempObj.id = key;
    locations.push(tempObj);
  }

  const voteForPlace = (token, wss, idVote) => {
    wss.send(
      JSON.stringify({
        method: "CREATE_VOTE",
        token: token,
        idVote,
      })
    );
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape" })
    );
    document.body.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape" }));
    wss.onmessage = (e) => {
      let method = "";
      const response = JSON.parse(e.data);
      method = response.method;
      if (!response.error) {
        switch (method) {
          case "CREATE_VOTE":
            if (response.voted == true) setVoted(true);
            break;
        }
      }
    };
  };

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
                  voteForPlace(match.token, wss, selected, setVoted)
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
              onClick={() => voteForPlace(match.token, wss, selected, setVoted)}
            >
              {t("vote")}
            </Button>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

ChoosePlace.getInitialProps = async () => {
  let places = [];
  return {
    namespacesRequired: ["choose-place"],
    places,
  };
};

const mapStateToProps = (state) => ({
  match: state.matches.match,
  auth: state.auth,
});

export default withTranslation("choose-place")(
  connect(mapStateToProps, {})(ChoosePlace)
);
