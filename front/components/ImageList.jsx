import {
  GridList,
  GridListTile,
  makeStyles,
  GridListTileBar,
} from "@material-ui/core";
import PerfectScrollbar from "react-perfect-scrollbar";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    padding: "0px 30px 0px 30px",
    maxHeight: "100%",
  },
  gridList: {
    width: "auto",
    height: "auto",
  },
}));

const ImageList = function ({
  items = [
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
    {
      img: "https://material-ui.com/static/images/grid-list/morning.jpg",
      name: "Image",
    },
  ],
  maxWidth = "auto",
  maxHeight = "auto",
  cellHeight = 80,
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
            <GridListTile key={`img_${index}`} cols={1}>
              <img src={tile.img} alt={tile.title} />
              <GridListTileBar title={tile.name} />
            </GridListTile>
          ))}
        </GridList>
      </PerfectScrollbar>
    </div>
  );
};

export default ImageList;
