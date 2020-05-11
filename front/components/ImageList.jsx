import {
  GridList,
  GridListTile,
  makeStyles,
  GridListTileBar,
  IconButton,
} from "@material-ui/core";
import PerfectScrollbar from "react-perfect-scrollbar";
import RadioButtonUnchecked from "@material-ui/icons/RadioButtonUnchecked";
import CheckCircle from "@material-ui/icons/CheckCircle";
import { useState } from "react";

const useStyles = makeStyles((theme) => ({
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
  fieldTitle = "title",
  fieldImage = "image",
}) {
  const styles = useStyles();
  const [selected, setSelected] = useState(undefined);

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
              onClick={() => setSelected(tile._id)}
              className={styles.itemImage}
            >
              <img src={tile[fieldImage]} alt={tile[fieldTitle]} />
              <GridListTileBar
                actionIcon={
                  <IconButton aria-label={`icon ${tile[fieldTitle]}`}>
                    {selected !== tile._id && (
                      <RadioButtonUnchecked className={styles.icon} />
                    )}
                    {selected === tile._id && (
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

export default ImageList;
