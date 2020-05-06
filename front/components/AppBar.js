import {
  Box,
  makeStyles,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from "@material-ui/core";
import { withTranslation } from "../plugins/i18n";
import { ExpandMore, ExpandLess } from "@material-ui/icons";
import { useState } from "react";
import SpyFallLogo from "../public/assets/logo.svg";

const useStyles = makeStyles((theme) => ({
  bar: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
}));

const AppBar = function ({ hidden = false, t }) {
  const styles = useStyles();
  const [anchor, setAnchor] = useState(null);

  if (hidden) return <></>;

  return (
    <Box className={styles.bar}>
      <SpyFallLogo style={{ width: 130, height: 60 }} />

      <Box display="flex" justifyContent="center" alignItems="center">
        <Avatar></Avatar>

        <IconButton
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          {anchor === null && <ExpandMore />}
          {anchor !== null && <ExpandLess />}
        </IconButton>

        <Menu
          open={anchor !== null}
          keepMounted
          onClose={(_) => setAnchor(null)}
          anchorEl={anchor}
        >
          <MenuItem>{t("how-to-play")}</MenuItem>
          <MenuItem>{t("logout")}</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

AppBar.getInitialProps = async () => ({
  namespacesRequired: ["app-bar"],
});

export default withTranslation("app-bar")(AppBar);
