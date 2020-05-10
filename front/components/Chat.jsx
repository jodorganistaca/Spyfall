import { IconButton, Popover, makeStyles } from "@material-ui/core";
import CustomTooltip from "./CustomTooltip";
import ChatContainer from "./ChatContainer";
import { Chat as ChatIcon } from "@material-ui/icons";
import { useState } from "react";

const useStyles = makeStyles((theme) => ({
  chatIcon: { color: theme.palette.success.main },
}));

const Chat = function ({ title }) {
  const [anchor, setAnchor] = useState(null);

  const styles = useStyles();

  return (
    <>
      <CustomTooltip
        title={title}
        aria-label={title}
        style={{ fontSize: "0.83rem" }}
      >
        <IconButton
          className={styles.chatIcon}
          variant="contained"
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          <ChatIcon style={{ width: 30, height: 30 }} />
        </IconButton>
      </CustomTooltip>

      <Popover
        id="simple-menu"
        anchorEl={anchor}
        keepMounted
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <ChatContainer />
      </Popover>
    </>
  );
};

export default Chat;
