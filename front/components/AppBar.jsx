import {
  Box,
  makeStyles,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Typography
} from "@material-ui/core";
import { withTranslation } from "../plugins/i18n";
import { ExpandMore, ExpandLess, Help } from "@material-ui/icons";
import { useState } from "react";
import SpyFallLogo from "../public/assets/logo.svg";
import CustomTooltip from "../components/CustomTooltip";
import { logout } from "../store/actions/auth";
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  bar: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
}));

const AppBar = function ({ hidden = false, t, auth, logout, info }) {
  const styles = useStyles();
  const [anchor, setAnchor] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  if (hidden) return <></>;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" width="100%">
      <Box className={styles.bar} flexDirection="row">
        <SpyFallLogo style={{ width: 130, height: 60 }} />

        <Box display="flex" justifyContent="center" alignItems="center">
          {auth && auth.user ? (
            <Avatar alt="User photo" src={auth.user.user.avatar}></Avatar>
          ) : (
            <Avatar></Avatar>
          )}

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
            {auth && auth.user && (
              <MenuItem onClick={() => logout()}>{t("logout")}</MenuItem>
            )}
          </Menu>
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" alignItems="center" width="100%">
        <CustomTooltip
          title={t("how-to-play")}
          aria-label={t("how-to-play")}
          style={{ fontSize: "0.83rem" }}
          tabindex={0}
        >
          <IconButton color="secondary" variant="contained" onClick={() => setShowInfo(!showInfo)}>
            <Help style={{ width: 30, height: 30 }} />
          </IconButton>
        </CustomTooltip>
        
      </Box>
      <Box display="flex" flexDirection="row" alignItems="center" width="100%">
        {
          showInfo ?
          <Typography variant="h5" style={{width: "200px", marginTop: `${info.length}px`,position: "absolute"}}>
            {info}
          </Typography>
          :
          <div/>
        }
      </Box>
    </Box>
    
  );
};

AppBar.getInitialProps = async () => ({
  namespacesRequired: ["app-bar"],
});

export default withTranslation("app-bar")(connect(null, { logout })(AppBar));
