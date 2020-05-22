// src/websocket.js

// This exported function is used to initialize the websocket connection
// to the server
export const startWebsocketConnection = () => {
  const ws = new window.WebSocket("ws://localhost:3001");
  // A new Websocket connection is initialized with the server

  // If the connection is successfully opened, we log to the console
  ws.onopen = () => {
    console.log("opened ws connection");
  };

  // If the connection is closed, we log that as well, along with
  // the error code and reason for closure
  ws.onclose = (e) => {
    console.log("close ws connection: ", e.code, e.reason);
  };

  // This callback is called everytime a message is received.
  ws.onmessage = (e) => {
    // The onMessageCallback function is called with the message
    // data as the argument
    onMessageCallback && onMessageCallback(e.data);
  };
  return ws;
};
