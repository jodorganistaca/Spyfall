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
const MATCH_CREATION = "MATCH_CREATION";
const BEGIN_MATCH = "BEGIN_MATCH";
const CHAT = "CHAT";
const JOIN_MATCH = "JOIN_MATCH";
const CREATE_TIMER = "CREATE_TIMER";
const CREATE_VOTE = "CREATE_VOTE";
const { Match } = require("../db/models/Match");
const { User } = require("../db/models/User");
const { Player } = require("../db/models/Player");
const { Message } = require("../db/models/Message");
const { Timer } = require("../db/models/Timer");
const _ = require("lodash");

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
exports.setup = (server, session) => {
  const wss = new WebSocket.Server({
    server,
    verifyClient: (info, done) => {
      session(info.req, {}, () => {
        done(info.req.session);
      });
    },
  });
  wss.on("connection", (ws, connection) => {
    let user;
    if (connection.session && connection.session.passport)
      user = connection.session.passport.user;
    ws.send(JSON.stringify({ msg: "Connected" }));
    ws.on("message", (m) => {
      let msg = "";
      try {
        msg = JSON.parse(m);
      } catch (error) {
        ws.send(
          JSON.stringify({
            msg: "Error: JSON not parsable msg: " + msg,
          })
        );
      }

      //Decrypt method and token
      const { method, token } = msg;
      try {
        switch (method) {
          case MATCH_CREATION:
            if (!user) {
              const { name } = msg;
              if (!name) {
                throw new Error("Error: Name is required to join a match");
              }
              user = new User(null, name);
            }
            const { maxRounds } = msg;
            createMatch(maxRounds, user, ws);
            break;
          case JOIN_MATCH:
            if (!user) {
              const { name } = msg;
              if (!name) {
                throw new Error("Error: Name is required to join a match");
              }
              user = new User(null, name);
            }
            joinMatch(token, user, ws);
            break;
          case BEGIN_MATCH:
            const { minimumSpies } = msg;
            beginMatch(token, minimumSpies);
            break;
          case CHAT:
            const { message, player } = msg;
            chatWithinMatch(token, message, player);
            break;
          case CREATE_TIMER:
            const { duration } = msg;
            createTimer(token, duration);
            break;
          case CREATE_VOTE:
            const { votedUser } = msg;
            createVote(token, votedUser, ws);
            break;
          default:
            ws.send({
              msg: "Method not found: " + method,
            });
            break;
        }
      } catch (error) {
        ws.send(JSON.stringify(error.message));
      }
    });
    ws.send(JSON.stringify({ msg: "Connected!" }));
  });
};

/**
 * @function createMatch
 * @alias module:WebSocket.createMatch
 * Generates a match object based on existing matches and sends it to the creator.
 */
const createMatch = (maxRounds, user, client) => {
  let exists = true;
  let newMatch;
  let tempToken;
  while (exists) {
    tempToken = Math.floor(100000 + Math.random() * 900000);
    if (clients[tempToken]) {
      continue;
    } else exists = false;
  }
  new Match([{ client, user }], maxRounds, tempToken).then((newMatch) => {
    clients[newMatch.token] = newMatch;
    console.log("La partida", clients[newMatch.token]);
    client.send(JSON.stringify({ "Match token": newMatch.token }));
  });
};

/**
 * @function beginMatch
 * @alias module:WebSocket.beginMatch
 * Generates players roles within a match.
 */
const beginMatch = (token, minimumSpies = 1) => {
  if (!token) {
    throw new Error("Match's token is required");
  }
  if (!clients || !clients[token]) {
    throw new Error(`No players or connections to this match: ${token}`);
  } else {
    if (
      (clients[token].spies.players &&
        clients[token].spies.players.length > 0) ||
      (clients[token].notSpies.players &&
        clients[token].notSpies.players.length > 0)
    ) {
      throw new Error("Players already have roles");
    } else {
      if (clients[token].connectedClients.length == 1)
        throw new Error("A match must consist of a minimum of two players");
      if (minimumSpies >= clients[token].connectedClients.length)
        throw new Error(
          "The minimum number of spies must be lower than the quantity of players"
        );
      let spies = [];
      let users = [];
      while (spies.length < minimumSpies) {
        let spy =
          clients[token].connectedClients[
            Math.floor(Math.random() * clients[token].connectedClients.length)
          ];
        //TODO: Set default location of spy using collection
        spy.player = new Player(spy.user, "Spy", "Any");

        if (spies.includes(spy)) continue;
        else {
          users.push(spy.user);
          delete spy.user;
          spies.push(spy);
        }
      }

      let notSpies = clients[token].connectedClients.filter(
        (el) => !spies.includes(el)
      );

      let roles = clients[token].location.roles;
      shuffle(roles);
      notSpies.forEach((e) => {
        e.player = new Player(e.user, roles.pop(), {
          name: clients[token].location.name,
          image: clients[token].location.image,
        });
        users.push(e.user);
        delete e.user;
      });
      clients[token].spies.players = spies;
      clients[token].notSpies.players = notSpies;
      clients[token].waiting = false;
      clients[token].spies.players.forEach((obj) =>
        obj.client.send(
          JSON.stringify({
            msg: "Match has started",
            player: obj.player,
            users,
          })
        )
      );
      clients[token].notSpies.players.forEach((obj) =>
        obj.client.send(
          JSON.stringify({
            msg: "Match has started",
            player: obj.player,
            users,
          })
        )
      );
      return;
    }
  }
};

const joinMatch = (token, user, client) => {
  if (token) {
    if (!clients[token]) {
      let newArray = [];
      newArray.push({ client, user });
      clients[token].connectedClients = newArray;
    } else {
      if (
        (clients[token].spies.players &&
          clients[token].spies.players.length > 0) ||
        (clients[token].notSpies.players &&
          clients[token].notSpies.players.length > 0)
      )
        throw new Error("Match has already begun. Players already assigned");
      else {
        if (clients[token].connectedClients.length == 12)
          throw new Error("Match room already full");
        for (let a = 0; a < clients[token].connectedClients.length; a++) {
          if (_.isEqual(clients[token].connectedClients[a].user, user))
            throw new Error(
              "User already exists in the match, try changing your name"
            );
        }
        clients[token].connectedClients.push({ client, user });
      }
    }
    client.send(
      JSON.stringify({ msg: "Connected to match. New status -> Waiting" })
    );
    let waitingUsers = [];
    clients[token].connectedClients.forEach((obj) =>
      waitingUsers.push(obj.user)
    );
    clients[token].connectedClients.forEach((obj) => {
      obj.client.send(JSON.stringify({ waitingUsers }));
    });
  }
};

const chatWithinMatch = (token, message, user) => {
  if (token) {
    if (!clients[token]) {
      throw new Error("Match not found");
    } else {
      if (
        !clients[token].spies.players ||
        clients[token].spies.players.length == 0 ||
        !clients[token].notSpies.players ||
        clients[token].notSpies.players.length == 0
      )
        throw new Error(
          "Match has not begun. Therefore chatting is prohibited"
        );
      else {
        clients[token].chat.push(new Message(user, message));
        const chat = clients[token].chat;
        clients[token].connectedClients.forEach((obj) =>
          obj.client.send(JSON.stringify({ chat }))
        );
      }
    }
  }
};

//TODO: WS de acabar partida/puntaje/localizaciones
const createVote = (token, votedUser, ws) => {
  if (token) {
    if (!clients[token]) {
      throw new Error("Match not found");
    } else {
      if (
        !clients[token].spies.players ||
        clients[token].spies.players.length == 0 ||
        !clients[token].notSpies.players ||
        clients[token].notSpies.players.length == 0
      )
        throw new Error("Match has not begun. Therefore voting is prohibited");
      else {
        if (
          clients[token].usersWhoVoted &&
          clients[token].usersWhoVoted.includes(ws)
        ) {
          throw new Error("User already voted in this round");
        }
        let found = false;
        let lookupRegistered = false;
        if (votedUser["email"]) lookupRegistered = true;
        console.log("lookup", lookupRegistered);
        console.log("looking for", votedUser);
        for (
          let i = 0;
          i < clients[token].spies.players.length && !found;
          i++
        ) {
          actualClient = clients[token].spies.players[i];
          console.log("actual spy", actualClient.player.user);
          if (lookupRegistered) {
            if (
              actualClient.player.user.email === votedUser.email &&
              actualClient.player.user.name === votedUser.name
            )
              found = true;
          } else {
            if (actualClient.player.user.name === votedUser.name) found = true;
          }
          if (found) {
            if (actualClient.player.votes) actualClient.player.votes += 1;
            else actualClient.player.votes = 1;
            console.log(actualClient.player);
            let foundUser = false;
            for (
              let a = 0;
              a < clients[token].notSpies.players.length && !foundUser;
              a++
            ) {
              let winningUser = clients[token].notSpies.players[a];
              if (
                ws._socket.remoteAddress ===
                winningUser.client._socket.remoteAddress
              ) {
                if (
                  !winningUser.player.user.score ||
                  isNaN(winningUser.player.user.score)
                )
                  winningUser.player.user.score = 1;
                else winningUser.player.user.score += 1;
                foundUser = true;
              }
            }
            break;
          }
        }
        for (
          let i = 0;
          i < clients[token].notSpies.players.length && !found;
          i++
        ) {
          actualClient = clients[token].notSpies.players[i];
          if (lookupRegistered) {
            if (
              actualClient.player.user.email === votedUser.email &&
              actualClient.player.user.name === votedUser.name
            )
              found = true;
          } else {
            if (actualClient.player.user.name === votedUser.name) found = true;
          }
        }
        if (found) {
          if (clients[token].usersWhoVoted)
            clients[token].usersWhoVoted.push(ws);
          else {
            clients[token].usersWhoVoted = [ws];
          }
        }

        return found
          ? ws.send(JSON.stringify({ msg: "Vote registered" }))
          : ws.send(JSON.stringify({ msg: "Voted user not found" }));
      }
    }
  }
};

const createTimer = (token, duration) => {
  if (token) {
    if (!clients[token]) {
      throw new Error("Match not found");
    } else {
      if (
        !clients[token].spies.players ||
        clients[token].spies.players.length == 0 ||
        !clients[token].notSpies.players ||
        clients[token].notSpies.players.length == 0
      )
        throw new Error(
          "Match has not begun. Therefore creating a timer is prohibited"
        );
      else {
        clients[token].timer = new Timer(duration);
        const timer = clients[token].timer;
        clients[token].connectedClients.forEach((obj) =>
          obj.client.send(JSON.stringify({ timer }))
        );
      }
    }
  }
};

const shuffle = (array) => {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

/**
 * @function notifyChanges
 * @alias module:WebSocket.notifyChanges
 * Notify all users with a specific _id (matchId in this case) the changes on a document.
 */
exports.notifyChanges = (_id, document) => {
  if (clients[_id]) {
    if (!clients[_id].spies && clients[_id].notSpies)
      return clients[_id].forEach((client) =>
        client.send(JSON.stringify(document))
      );
    else {
      clients[_id].spies.forEach((client) =>
        client.send(JSON.stringify(document))
      );
      return clients[_id].notSpies.forEach((client) =>
        client.send(JSON.stringify(document))
      );
    }
  }
};

/**
 * @function notifyChangesRoleWise
 * @alias module:WebSocket.notifyChangesRoleWise
 * Notify role-wise users with a specific _id (matchId in this case) the changes on a document.
 */
exports.notifyChangesRoleWise = (_id, document, role) => {
  if (clients[_id] && clients[_id][role]) {
    clients[_id][role].forEach((client) => client.send(document));
  }
};
