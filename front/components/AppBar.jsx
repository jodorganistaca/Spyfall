import {
  Box,
  makeStyles,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Button
} from "@material-ui/core";
import { withTranslation } from "../plugins/i18n";
import { ExpandMore, ExpandLess, Help, EmojiEvents } from "@material-ui/icons";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import { useState, useEffect } from "react";
import SpyFallLogo from "../public/assets/logo.svg";
import CustomTooltip from "../components/CustomTooltip";
import { logout } from "../store/actions/auth";
import { connect } from "react-redux";
import http from "../plugins/axios";
import Scoreboard from "../components/Scoreboard";

const useStyles = makeStyles((theme) => ({
  bar: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    borderRadius: "10px",
    borderWidth: "0px",
    borderColor: "transparent",
    flexDirection: "column",
  },
  button: {
    borderRadius: "87px",
    margin: "10px 2px 2px 2px",
    width: 300,
    letterSpacing: 1.25,
  },
}));

const AppBar = function ({ hidden = false, t, auth, logout, info }) {
  const styles = useStyles();
  const [anchor, setAnchor] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [playersPosition, setPlayersPosition] = useState(false);
  const [rows, setRows] = useState([]);

  if (hidden) return <></>;

  useEffect(async () => {
    try {
      let rows = await http.get("http://localhost:3001/players");
      setRows(rows.data);
    } catch (error) {}
  }, []);

  return (
    <Box role="navigation" display="flex" flexDirection="column" alignItems="center" width="100%">
      <Box className={styles.bar} flexDirection="row">
        <SpyFallLogo role="none" style={{ width: 130, height: 60 }} />

        <Box display="flex" justifyContent="center" alignItems="center">
          {auth && auth.user ? (
            <Avatar alt="User photo" src={auth.user.user.avatar}></Avatar>
          ) : (
            <Avatar></Avatar>
          )}

          <IconButton
            id="menubutton"
            aria-controls="simple-menu"
            aria-label="simple-menu-button"
            aria-haspopup="true"
            onClick={(event) => setAnchor(event.currentTarget)}
          >
            {anchor === null && <ExpandMore />}
            {anchor !== null && <ExpandLess />}
          </IconButton>

          <Menu
            id="simple-menu"
            role="none"
            open={anchor !== null}
            keepMounted
            onClose={(_) => setAnchor(null)}
            anchorEl={anchor}
          >
            <MenuItem role="menuitem" aria-label="how-to-play">{t("how-to-play")}</MenuItem>
            {auth && auth.user && (
              <MenuItem role="menuitem" aria-label="logout" onClick={() => logout()}>{t("logout")}</MenuItem>
            )}
          </Menu>
        </Box>
      </Box>
      <Box display="flex" flexDirection="row-reverse" alignItems="center" width="100%">
        <CustomTooltip
          title={t("help")}
          aria-label={t("help")}
          style={{ fontSize: "0.83rem", right: "15px" }}
        >
          <IconButton color="secondary" variant="contained" onClick={() => setShowInfo(!showInfo)}>
            <Help style={{ width: 30, height: 30 }} />
          </IconButton>
        </CustomTooltip>
      </Box>
     
      <Box display="flex" flexDirection="row-reverse" alignItems="center" width="100%">
        <CustomTooltip
          title={t("Trophy")}
          aria-label={t("trophy")}
          style={{ fontSize: "0.83rem", right: "15px" }}
        >
          <IconButton style={{ color: 'yellow', right: "15px"  }} variant="contained" onClick={() => setPlayersPosition(!playersPosition)}>
            <EmojiEvents style={{ width: 30, height: 30 }} />
          </IconButton>
        </CustomTooltip>
        
      </Box>
      
      {/*Modal for info of a single page*/ }
      <Box display="flex" flexDirection="row" alignItems="center" width="100%">
        {
          showInfo ?
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={styles.modal}
            open={showInfo}
            onClose={() => setShowInfo(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
          >
            <Fade in={showInfo}>
              <div className={styles.paper}>
                <Typography variant="h5" style={{width: "300px", }}>
                  {info}
                </Typography>
                
                <Button
                  className={styles.button}
                  color="primary"
                  variant="contained"
                  onClick={() => setShowInfo(false)}
                >
                  {t("ok")}
                </Button>
              </div>
            </Fade>
          </Modal>
          :
          <div/>
        }
      </Box>

      {/*Modal for positions of the players*/}
      <Box display="flex" flexDirection="row" alignItems="center" width="100%">
        {
          playersPosition ?
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={styles.modal}
            open={playersPosition}
            onClose={() => setPlayersPosition(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
          >
            <Fade in={playersPosition}>
              <div className={styles.paper}>
                <Scoreboard rows={rows} />
                <div style={{ width: "100%", textAlign: "center" }}>
                  <Button
                    className={styles.button}
                    color="primary"
                    variant="contained"
                    onClick={() => setPlayersPosition(false)}
                  >
                    {t("ok")}
                  </Button>
                </div>
                
              </div>
            </Fade>
          </Modal>
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
