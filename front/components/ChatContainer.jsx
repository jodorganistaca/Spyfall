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

const useStyles = makeStyles((theme) => ({
  message: {
    backgroundColor,
  },
}));

const Message = ({ content, sender }) => (
  <Box
    display="flex"
    alignSelf="stretch"
    width="100%"
    justifyContent={sender === "receiver" ? "flex-start" : "flex-end"}
    marginTop="3px"
    marginBottom="3px"
  >
    {sender === "receiver" && (
      <Avatar>
        <Image src={"/public/assets/logo.png"} />
      </Avatar>
    )}

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
      <Avatar>
        <Image src={"/public/assets/logo.png"} />
      </Avatar>
    )}
  </Box>
);

class ChatContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      messageToSend: undefined,
      id: 0,
    };
  }

  componentWillMount() {
    // let id = this.props.navigation.getParam("id", 0);
    // this.setState({ id: id.toString() });
    this.getMessages("id.toString()");
  }

  getMessages(id) {
    // chat.getMessages(id).onSnapshot((querySnapshot) => {
    //   const list = [];
    //   if (querySnapshot)
    //     querySnapshot.forEach((doc) => {
    //       const { content, sender, timestamp } = doc.data();
    //       list.push({
    //         id: doc.id,
    //         content: content,
    //         timestamp: timestamp,
    //         sender: sender,
    //       });
    //     });
    //   this.setState({ messages: list });
    // });

    this.setState({
      messages: [
        {
          id: "asdasdas",
          content: "Mock",
          timestamp: new Date(),
          sender: "sender",
        },
        {
          id: "asdasdas",
          content: "Mock",
          timestamp: new Date(),
          sender: "receiver",
        },
      ],
    });
  }

  async sendMessage() {
    // try {
    //   let response = await chat.sendMessage(
    //     this.state.id + "",
    //     null,
    //     this.state.messageToSend,
    //     Date.now().toLocaleString()
    //   );
    //   this.setState({ messageToSend: undefined });
    // } catch (error) {
    //   console.error(error);
    // }
  }

  render() {
    return (
      <Box justifyContent="space-between" height="100%">
        <Box bgcolor="secondary.light" width="100%" padding="5px">
          <Typography variant="subtitle1" style={{ color: "#fff" }}>
            Chat
          </Typography>
        </Box>

        <Paper
          elevation={1}
          style={{
            height: "100%",
            minHeight: "300px",
            display: "flex",
            flexDirection: "column-reverse",
            margin: "5px",
          }}
        >
          <PerfectScrollbar
            style={{
              height: "100%",
              minHeight: "300px",
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
              />
            ))}
          </PerfectScrollbar>
        </Paper>

        <Box justifyContent="center" alignContent="center" padding="10px">
          <TextField
            style={{ flex: 3, width: "auto" }}
            label="Escribe tu mensaje aquí"
            defaultValue={this.state.messageToSend}
          />
          <IconButton>
            <Send />
          </IconButton>
        </Box>
      </Box>
    );
  }
}

export default ChatContainer;
