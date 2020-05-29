import { Component } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Typography,
  makeStyles,
  Avatar,
} from "@material-ui/core";
import { Send, Image } from "@material-ui/icons";
import { withTranslation } from "../plugins/i18n";
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  message: {
    backgroundColor,
  },
}));

const Message = ({ content, sender, user, date }) => (
  <Box
    display="flex"
    alignSelf="stretch"
    width="100%"
    justifyContent={sender === "receiver" ? "flex-start" : "flex-end"}
    marginTop="3px"
    marginBottom="3px"
  >
    {sender === "receiver" && (
      <Avatar src={user.avatar}>
        <Image />
      </Avatar>
    )}
    {user.name}
    <Box
      margin="0px 10px 0px 10px"
      padding="10px 20px 10px 20px"
      bgcolor={sender === "receiver" ? "primary.main" : "secondary.main"}
      style={{
        borderRadius: "20px",
        borderTopRightRadius: sender !== "receiver" ? "0px" : "20px",
        borderTopLeftRadius: sender === "receiver" ? "0px" : "20px",
        alignSelf: sender === "receiver" ? "flex-start" : "flex-end",
        width: 150,
        wordBreak: "break-all",
      }}
    >
      <Typography
        align={sender == "receiver" ? "start" : "end"}
        variant="caption"
      >
        {content}
      </Typography>
    </Box>
    {sender === "sender" && (
      <Avatar src={user.avatar}>
        <Image />
      </Avatar>
    )}
  </Box>
);

class ChatContainer extends Component {
  constructor(props) {
    super(props);
    this.receiveMessages = this.receiveMessages.bind(this);
    this.match = props.match;
    this.state = {
      messages: [],
      messageToSend: "",
      id: 0,
    };
  }

  sendMessage = (token, chattingUser) => {
    this.match.wss.send(
      JSON.stringify({
        method: "CHAT",
        token,
        message: this.state.messageToSend,
        chattingUser,
      })
    );
    this.setState({ messageToSend: "" });
  };

  listenMatch = () => {
    this.match.wss.onmessage = (e) => {
      let method = "";
      const response = JSON.parse(e.data);
      if (!response.error) {
        let messages = response.chat;
        method = response.method;
        switch (method) {
          case "CHAT":
            messages.forEach((element) => {
              if (element.user.id == this.match.player.user.id) {
                console.log("Same id");
                element.sender = "sender";
              } else element.sender = "receiver";
              element.content = element.message;
              console.log(element);
            });
            this.setState({
              messages,
            });
            break;
        }
      }
      console.log("chat container", e);
    };
    console.log(this.match);
    console.log(this.match !== null);
  };

  componentWillMount() {
    if (this.match && this.match.wss) {
      this.listenMatch();
      console.log("web socket chat  ", this.match.wss);
    }
  }
  receiveMessages(event) {
    let messages = JSON.parse(event.data).chat;
    messages.forEach((element) => {
      if (element.user == user) element.sender = "sender";
      else element.user = "receiver";
      element.content = element.message;
    });
    messages.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.setState({ messages });
  }

  handleChange(e) {
    this.setState({ messageToSend: e.target.value });
  }

  render() {
    return (
      <Box
        justifyContent="space-between"
        height="300px"
        style={{ overflow: "scroll" }}
      >
        <Box bgcolor="secondary.light" width="100%" padding="5px">
          <Typography variant="subtitle1" style={{ color: "#fff" }}>
            Chat
          </Typography>
        </Box>

        <Paper
          elevation={1}
          style={{
            height: "100%",
            minHeight: "200px",
            display: "flex",
            flexDirection: "column-reverse",
            margin: "5px",
          }}
        >
          <PerfectScrollbar
            style={{
              height: "100%",
              minHeight: "200px",
              display: "flex",
              flexDirection: "column-reverse",
              margin: "5px",
            }}
          >
            {this.state.messages.map((value) => (
              <Message
                key={value.id}
                content={value.content}
                sender={value.sender}
                user={value.user}
              />
            ))}
          </PerfectScrollbar>
        </Paper>

        <Box justifyContent="center" alignContent="center" padding="10px">
          <TextField
            style={{ flex: 3, width: "auto" }}
            label="Escribe tu mensaje aquí"
            value={this.state.messageToSend}
            onChange={(e) => this.setState({ messageToSend: e.target.value })}
            onKeyDown={(e) => {
              if (e.key == "Enter")
                this.sendMessage(this.match.token, this.match.player.user);
            }}
          />
          <IconButton
            onClick={() => {
              return this.sendMessage(this.match.token, this.match.player.user);
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    );
  }
}

const mapStateToProps = (state) => ({
  match: state.matches.match,
  chat: state.matches.chat,
});

export default withTranslation("ChatContainer")(
  connect(mapStateToProps, null)(ChatContainer)
);
