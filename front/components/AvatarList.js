import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Avatar,
  Grid,
  Paper,
  Typography,
  Box,
} from "@material-ui/core";
import Image from "material-ui-image";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 260,
    backgroundColor: theme.palette.background.paper,
    margin: "5px auto 5px auto",
    borderRadius: 50,
  },
  playersCount: {
    marginRight: 50,
    fontFamily: "'Raleway', sans-serif",
    fontSize: "0.8rem",
  },
}));

const UserAvatar = ({ pic, name }) => {
  const styles = useStyles();
  return (
    <Paper elevation={1} className={styles.root}>
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <Image src={pic} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={name} />
      </ListItem>
    </Paper>
  );
};

const AvatarList = function ({
  items,
  noCounter = false,
  orientation = "horizontal",
}) {
  const styles = useStyles();
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
      alignSelf="stretch"
    >
      <Grid container spacing={0} alignItems="center" justify="center">
        {items.map((item, index) => (
          <Grid
            key={index}
            item
            xs={orientation === "horizontal" ? 12 : 12}
            sm={orientation === "horizontal" ? 6 : 12}
            md={orientation === "horizontal" ? 4 : 12}
            alignItems="center"
            justify="center"
            wrap="nowrap"
            spacing={2}
          >
            <UserAvatar name={item.name} pic={item.pic} />
          </Grid>
        ))}
      </Grid>
      {!noCounter && (
        <Typography
          variant="caption"
          align="right"
          className={styles.playersCount}
        >{`${items.length}/12`}</Typography>
      )}
    </Box>
  );
};

export default AvatarList;
