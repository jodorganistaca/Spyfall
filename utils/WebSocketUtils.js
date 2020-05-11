/**
 * MongoDB driver module.
 * @module WebSocketUtils
 * @author Juan Sebastián Bravo <js.bravo@uniandes.edu.co>
 */

/**
 * @constant WebSocket
 * @type {NodeModule}
 * Loads WebSocket module.
 */
const WebSocket = require("ws");

/**
 * @constant url
 * @type {NodeModule}
 * Loads url module.
 */
const url = require("url");
/**
 * @var clients
 * @type {Object}
 * Clients connected to the WebSocket.
 */
let clients = {};
/**
 * @function setup
 * @alias module:WebSocket.setup
 * Creates the WebSockets an adds clients to a table based on the id they sent as URL Query Param = "matchId"
 */
exports.setup = (server) => {
  const ws = new WebSocket.Server({ server });
  console.log("New Connection!");
  ws.on("connection", (newClient, connection) => {
    const client_url = connection.url;
    const { matchId } = url.parse(client_url, true).query;
    if (!clients[matchId]) {
      {
        let newArray = [];
        newArray.push(newClient);
        clients[matchId] = newArray;
      }
    } else {
      clients[matchId].push(newClient);
    }
    console.log("Added new", clients);
  });
};

/**
 * @function notifyChanges
 * @alias module:WebSocket.notifyChanges
 * Notify all users with a specific _id (matchId in this case) the changes on a document.
 */
exports.notifyChanges = (_id, document) => {
  console.log("Notifying!");
  if (clients[_id]) {
    clients[_id].forEach((client) => client.send(document));
  }
};
