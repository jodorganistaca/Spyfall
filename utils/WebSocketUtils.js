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
const SPY_ROLE = "SPY";
const NOT_SPY_ROLE = "NOT_SPY";
const ERROR = "ERROR";
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
                throw new Error("Error: Username is required to join a match");
              }
              const regexp = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
              if (regexp.test(name)) {
                throw new Error(
                  "Error: Username can't have special characters (including spaces)!"
                );
              }
              const fakeEmail = `${name}@nouser.com`;
              user = new User(fakeEmail, name);
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
              const fakeEmail = `${name}@nouser.com`;
              user = new User(fakeEmail, name);
            }
            joinMatch(token, user, ws);
            break;
          case BEGIN_MATCH:
            const { minimumSpies } = msg;
            beginMatch(token, minimumSpies);
            break;
          case CHAT:
            const { message, chattingUser } = msg;
            chatWithinMatch(token, message, chattingUser);
            break;
          case CREATE_TIMER:
            const { duration } = msg;
            createTimer(token, duration);
            break;
          case CREATE_VOTE:
            const { idVote } = msg;
            createVote(token, idVote, ws);
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
  let newClient = {
    [user.email]: { client: client._socket.remoteAddress, user },
  };
  new Match(
    newClient,
    { [client._socket.remoteAddress]: { ws: client, email: user.email } },
    maxRounds,
    tempToken
  ).then((newMatch) => {
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
      let spies = {};
      let users = [];
      let clientsIps = Object.keys(clients[token].connectedClients);
      let newIds = [];
      for (let i = 0; i < clientsIps.length; i++) {
        let exists = true;
        while (exists) {
          let tempId = Math.floor(100000 + Math.random() * 900000);
          if (newIds.includes(tempId)) {
            continue;
          } else {
            newIds.push(tempId);
            exists = false;
          }
        }
      }
      while (Object.keys(spies).length < minimumSpies) {
        let tmpEmail = clientsIps[(clientsIps.length * Math.random()) << 0];
        let spy = clients[token].connectedClients[tmpEmail];
        //TODO: Set default location of spy using collection
        spy.user.id = newIds.pop();
        spy.player = new Player(spy.user, "Spy", "Any");

        if (spies[tmpEmail]) continue;
        else {
          console.log("spy.user", spy.user);
          const theSpy = Object.assign({}, spy.user);
          delete theSpy.email;
          users.push(theSpy);
          delete spy.user;
          spies[tmpEmail] = spy;
        }
      }
      let notSpies = Object.assign({}, clients[token].connectedClients);
      for (const [email, obj] of Object.entries(spies)) {
        delete notSpies[email];
        //delete obj.player.user.email;
        spies[spies[email].player.user.id] = obj;
        delete spies[email];
      }
      console.log("updatedSpies", spies);
      let roles = clients[token].location.roles;
      shuffle(roles);
      for (const [email, obj] of Object.entries(notSpies)) {
        obj.user.id = newIds.pop();
        obj.player = new Player(obj.user, roles.pop(), {
          name: clients[token].location.name,
          image: clients[token].location.image,
        });
        const tempUser = Object.assign({}, obj.user);
        delete tempUser.email;
        users.push(tempUser);
        delete obj.user;
        notSpies[notSpies[email].player.user.id] = obj;
        delete notSpies[email];
      }
      clients[token].spies = spies;
      clients[token].notSpies = notSpies;
      clients[token].waiting = false;
      for (const [email, obj] of Object.entries(spies)) {
        clients[token].clientsDictionary[obj.client].id = obj.player.user.id;
        const copy = Object.assign({}, obj.player);
        delete copy.user.email;
        clients[token].clientsDictionary[obj.client].ws.send(
          JSON.stringify({
            msg: "Match has started",
            player: copy,
            users,
            locations: clients[token].allLocations,
          })
        );
      }

      for (const [email, obj] of Object.entries(notSpies)) {
        clients[token].clientsDictionary[obj.client].id = obj.player.user.id;
        const copy = Object.assign({}, obj.player);
        delete copy.user.email;
        clients[token].clientsDictionary[obj.client].ws.send(
          JSON.stringify({
            msg: "Match has started",
            player: copy,
            users,
          })
        );
      }
      return;
    }
  }
};

const joinMatch = (token, user, client) => {
  if (token && user && client) {
    if (!clients[token]) {
      throw new Error(`Match with token ${token} doesn't exist`);
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
        if (clients[token].connectedClients[user.email])
          throw new Error(
            "User already exists in the match, try changing your username or play anonymously"
          );
        if (clients[token].clientsDictionary[client._socket.remoteAddress]) {
          client.send("User connection already exists. It will be deleted");
          let tempEmail =
            clients[token].clientsDictionary[client._socket.remoteAddress]
              .email;
          delete clients[token].clientsDictionary[client._socket.remoteAddress];
          delete clients[token].connectedClients[tempEmail];
          return joinMatch(token, user, client);
        }
        clients[token].connectedClients[user.email] = {
          client: client._socket.remoteAddress,
          user,
        };
        clients[token].clientsDictionary[client._socket.remoteAddress] = {
          ws: client,
          email: user.email,
        };
      }
    }
    client.send(
      JSON.stringify({ msg: "Connected to match. New status -> Waiting" })
    );
    let waitingUsers = [];

    for (const [email, { client, user }] of Object.entries(
      clients[token].connectedClients
    )) {
      const userCopy = Object.assign({}, user);
      delete userCopy.email;
      waitingUsers.push(userCopy);
    }
    for (const [ip, { ws, email }] of Object.entries(
      clients[token].clientsDictionary
    )) {
      ws.send(JSON.stringify({ msg: "User joined", waitingUsers }));
    }
  } else
    throw new Error(
      `Not all parameters defined for joinMatch(token = ${token}, user = ${user}, client = ${client})`
    );
};

const chatWithinMatch = (token, message, user) => {
  if (token && message && user) {
    if (!clients[token]) {
      throw new Error("Match not found");
    } else {
      if (!clients[token].spies || !clients[token].notSpies)
        throw new Error(
          "Match has not begun. Therefore chatting is prohibited"
        );
      else {
        console.log("user", user);
        const newMessage = new Message(user, message);
        console.log("newMessage", newMessage);
        clients[token].chat.push(new Message(user, message));
        const chat = clients[token].chat;
        this.notifyChanges(token, { msg: "New message", chat });
      }
    }
  } else
    throw new Error(
      `Not all parameters defined for chatWithinMatch(token = ${token}, message = ${message}, chattingUser = ${user})`
    );
};

//TODO: WS de acabar partida/puntaje/localizaciones
const createVote = (token, idVote, ws) => {
  if (token && idVote && ws) {
    if (!clients[token]) {
      throw new Error("Match not found");
    } else {
      if (!clients[token].clientsDictionary[ws._socket.remoteAddress].id) {
        throw new Error("Voting user not found in match");
      }
      if (!clients[token].spies || !clients[token].notSpies)
        throw new Error("Match has not begun. Therefore voting is prohibited");
      let idVotingUser =
        clients[token].clientsDictionary[ws._socket.remoteAddress].id;
      if (
        clients[token].usersWhoVoted &&
        clients[token].usersWhoVoted.includes(idVotingUser)
      ) {
        throw new Error("User already voted in this round");
      }
      let role = clients[token].spies[idVotingUser]
        ? SPY_ROLE
        : clients[token].notSpies[idVotingUser]
        ? NOT_SPY_ROLE
        : ERROR;
      switch (role) {
        //Spies vote for locations
        case SPY_ROLE:
          let find = false;
          if (clients[token].allLocations[idVote]) {
            clients[token].allLocations[idVote].votes += 1;
            if (clients[token].location._id === idVote) {
              clients[token].spies[idVotingUser].player.user.score += 1;
              clients[token].score.spies += 1;
            }
            find = true;
          }
          console.log("Match status", clients[token]);
          return find
            ? ws.send(JSON.stringify({ msg: "Vote registered" }))
            : ws.send(JSON.stringify({ msg: "Voted location not found" }));
        //Not spies vote for players
        case NOT_SPY_ROLE:
          let found = false;
          if (clients[token].spies[idVote]) {
            found = true;
            clients[token].spies[idVote].player.votes += 1;
            clients[token].score.notSpies += 1;
            if (!clients[token].notSpies[idVotingUser])
              throw new Error("Spies are not allowed to vote on players");
            if (clients[token].notSpies[idVotingUser].player.user.score)
              clients[token].notSpies[idVotingUser].player.user.score += 1;
            else clients[token].notSpies[idVotingUser].player.user.score = 1;
          }
          if (clients[token].notSpies[idVote] && !found) {
            found = true;
            clients[token].notSpies[idVote].player.votes += 1;
          }

          if (found) {
            if (clients[token].usersWhoVoted)
              clients[token].usersWhoVoted.push(idVotingUser);
            else {
              clients[token].usersWhoVoted = [idVotingUser];
            }
          }
          console.log("Match status", clients[token]);
          return found
            ? ws.send(JSON.stringify({ msg: "Vote registered" }))
            : ws.send(JSON.stringify({ msg: "Voted user not found" }));

        default:
          throw new Error("Player's role not defined");
      }
    }
  } else
    throw new Error(
      `Not all parameters defined for createVote(token = ${token}, idVote = ${idVote}, ws = ${ws})`
    );
};

const createTimer = (token, duration) => {
  if (token) {
    if (!clients[token]) {
      throw new Error("Match not found");
    } else {
      if (!clients[token].spies || !clients[token].notSpies)
        throw new Error(
          "Match has not begun. Therefore creating a timer is prohibited"
        );
      else {
        clients[token].timer = new Timer(duration);
        const timer = clients[token].timer;

        //TODO: Cron task
        this.notifyChanges(token, { msg: "Timer started", timer });
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
exports.notifyChanges = (token, document) => {
  this.notifyChangesRoleWise(token, document, "spies");
  this.notifyChangesRoleWise(token, document, "notSpies");
};

/**
 * @function notifyChangesRoleWise
 * @alias module:WebSocket.notifyChangesRoleWise
 * Notify role-wise users with a specific _id (matchId in this case) the changes on a document.
 */
exports.notifyChangesRoleWise = (token, document, role) => {
  if (clients[token]) {
    for (const [email, obj] of Object.entries(clients[token][role])) {
      clients[token].clientsDictionary[obj.client].id = obj.player.user.id;
      clients[token].clientsDictionary[obj.client].ws.send(
        JSON.stringify(document)
      );
    }
  }
};
