/**
 * WebSocketUtils module.
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
const db = require("../db/MongoUtils");
const config = require("config");
const dbName = config.get("dbName");
const usersCollection = config.get("usersCollection");
const _ = require("lodash");

/**
 * @var clients
 * @type {Object}
 * Clients connected to the WebSocket.
 */
let clients = {};

/**
 * Function that handles all methods requested through the WebSocket.
 * @function setup
 * @alias module:WebSocket.setup
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
  wss.on("connection", async (ws, connection) => {
    let user;
    if (connection.session && connection.session.passport) {
      user = connection.session.passport.user;
      user = await db.findOnePromise(dbName, usersCollection, user._id);
      user = user[0];
    }
    ws.on("message", (m) => {
      let msg = "";
      try {
        msg = JSON.parse(m);
      } catch (error) {
        ws.send(
          JSON.stringify({
            error: "Error: Not JSON parsable msg: " + msg,
          })
        );
      }
      console.log("Petition received", msg);
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
            console.log("New server status after create:", clients);
            break;
          case JOIN_MATCH:
            if (!user) {
              const { name } = msg;
              if (!name) {
                throw new Error("Error: Name is required to join a match");
              }
              const fakeEmail = `${name.toLowerCase()}@nouser.com`;
              user = new User(fakeEmail, name);
            }
            joinMatch(token, user, ws);
            console.log("New match status after join:", clients[token]);
            break;
          case BEGIN_MATCH:
            const { minimumSpies } = msg;
            beginMatch(token, minimumSpies);
            console.log("New match status after begin:", clients[token]);
            break;
          case CHAT:
            const { message, chattingUser } = msg;
            chatWithinMatch(token, message, chattingUser);
            console.log("New match status after chat:", clients[token]);
            break;
          case CREATE_TIMER:
            const { duration } = msg;
            createTimer(token, duration);
            break;
          case CREATE_VOTE:
            const { idVote } = msg;
            createVote(token, idVote, ws);
            console.log("New match status after vote:", clients[token]);
            break;
          default:
            throw new Error(`Method: ${method} not defined`);
            break;
        }
      } catch (error) {
        ws.send(JSON.stringify({ method, error: error.message }));
      }
    });
    ws.send(JSON.stringify({ msg: "Connected!" }));
  });
};

/**
 * Creates a match.
 * @description The function starts by creating temporal, unique ids for the players inside the match. Then, it picks randomly selected players and sets them as spies in the match. After that,
 * the players object gets filtered, so that only non - spies are there and assign them as non spies. Copies of objects are made to hide private fields in the WebSocket message, such as _id and email.
 * @post Match gets created. The creating user will receive a message through the WebSocket including:
 *  * method: CREATE_MATCH to identify which method was called.
 *  * token: Token of the created match.
 *  * waitingUsers: [User] To know which users are waiting (only the creator user). Used to map props easier in React.
 * @param {Number} maxRounds Maximum number of rounds in the match.
 * @param {User} User User that is creating the match.
 * @param {WebSocket} client WebSocket of the user creating the match.
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
    let waitingUsers = [];
    for (const [email, { client, user }] of Object.entries(
      clients[newMatch.token].connectedClients
    )) {
      const userCopy = Object.assign({}, user);
      delete userCopy.email;
      waitingUsers.push(userCopy);
    }
    client.send(
      JSON.stringify({
        method: MATCH_CREATION,
        token: newMatch.token,
        waitingUsers,
      })
    );
  });
};

/**
 * Begins (or restarts) a match.
 * @description The function starts by creating temporal, unique ids for the players inside the match. Then, it picks randomly selected players and sets them as spies in the match. After that,
 * the players object gets filtered, so that only non - spies are there and assign them as non spies. Copies of objects are made to hide private fields in the WebSocket message, such as _id and email.
 * @pre Match exists, has more than 1 user waiting and has not begun (in case it will be started, i.e not restarted).
 * @post Message gets created. Users receive a message including:
 *  * method: BEGIN_MATCH to identify which method was called.
 *  * player: {User, location, role} To send every player its role (spy or not spy). If it isn't spy, the user will receive a random role based on the location.
 *  * endTime: {Date} Time the server will end the match.
 *  * users: [User: {name, avatar, id}]  To vote for the user.
 *  * locations : {[_id of location]: {Location}} To vote for locations (only if they are spies).
 * @param {Number} token Token that identifies the match.
 * @param {Number} [minimumSpies] Minimum number of spies. By default = 1.
 * @param {Boolean} [restart] false if the match is new and will be started, true if its a new round with the same players.  By default = false.
 * @throws {Error} the token was not defined.
 * @throws {Error} if the match does not exist.
 * @throws {Error} if the number of waiting players is less than 2 (i.e only one user is trying to start the match).
 * @throws {Error} if the specified number of minimumSpies is greater or equal to the number of waiting players (i.e Match without not-spy users).
 */
const beginMatch = (token, minimumSpies = 1, restart = false) => {
  if (!token) {
    throw new Error("Match's token is required");
  }
  if (!clients || !clients[token]) {
    throw new Error(`No players or connections to this match: ${token}`);
  }
  if (Object.keys(clients[token].connectedClients).length <= 1) {
    throw new Error(
      `Matches require minimum 2 playes, actual number of players: ${
        Object.keys(clients[token].connectedClients).length
      }`
    );
  } else {
    if (!restart) {
      if (
        (clients[token].spies.players &&
          clients[token].spies.players.length > 0) ||
        (clients[token].notSpies.players &&
          clients[token].notSpies.players.length > 0)
      ) {
        throw new Error("Players already have roles");
      }
    } else {
      clients[token].spies = {};
      clients[token].notSpies = {};
    }
    if (minimumSpies >= Object.keys(clients[token].connectedClients).length)
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
    let allSpies = [];
    while (Object.keys(spies).length < minimumSpies) {
      let tmpEmail = clientsIps[(clientsIps.length * Math.random()) << 0];
      if (spies[tmpEmail]) continue;
      let spy = clients[token].connectedClients[tmpEmail];
      //TODO: Set default location of spy using collection
      spy.user.id = newIds.pop();
      spy.player = new Player(Object.assign({}, spy.user), "Spy", "Any");
      const theSpy = _.cloneDeep(spy.user);
      //User is now redundant as is in the player object.
      delete spy.user;
      //Delete confidential fields in copy.
      delete theSpy.email;
      delete theSpy.score;
      theSpy._id && delete theSpy._id;
      users.push(theSpy);
      allSpies.push(theSpy);
      let theSpyCopy = _.cloneDeep(spy);
      theSpyCopy.player.user.score = 0;
      spies[tmpEmail] = theSpyCopy;
    }
    let notSpies = Object.assign({}, clients[token].connectedClients);
    for (const [email, obj] of Object.entries(spies)) {
      //Delete all objects with email that belong in spies object
      delete notSpies[email];
      //Players are now id assigned, set object to id and remove the email-id object.
      spies[spies[email].player.user.id] = obj;
      delete spies[email];
    }
    let roles = clients[token].location.roles;
    shuffle(roles);
    for (const [email, obj] of Object.entries(notSpies)) {
      //Get another random id
      obj.user.id = newIds.pop();
      //Assign locations to remaining (not spies) players
      let newRole = roles.pop();
      obj.player = new Player(obj.user, newRole, {
        name: clients[token].location.name,
        image: clients[token].location.image,
      });
      //User is now redundant as is in the player object.

      const tempUser = _.cloneDeep(obj.user);
      //Delete all confidential fields
      delete tempUser.email;
      delete tempUser.score;
      tempUser._id && delete tempUser._id;
      users.push(tempUser);
      delete obj.user;
      let theNotSpyCopy = _.cloneDeep(obj);
      theNotSpyCopy.player.user.score = 0;
      notSpies[notSpies[email].player.user.id] = theNotSpyCopy;
      delete notSpies[email];
    }
    clients[token].spies = spies;
    clients[token].notSpies = notSpies;
    clients[token].waiting = false;
    let endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + 2);
    for (const [email, obj] of Object.entries(spies)) {
      clients[token].clientsDictionary[obj.client].id = obj.player.user.id;
      const copy = Object.assign({}, obj.player);
      delete copy.user.email;
      let alsoSpies = allSpies;
      alsoSpies = alsoSpies.filter((e) => e.id !== obj.player.user.id);
      clients[token].clientsDictionary[obj.client].ws.send(
        JSON.stringify({
          method: BEGIN_MATCH,
          player: copy,
          users,
          locations: clients[token].allLocations,
          endTime,
          alsoSpies,
        })
      );
    }

    for (const [email, obj] of Object.entries(notSpies)) {
      clients[token].clientsDictionary[obj.client].id = obj.player.user.id;
      const copy = Object.assign({}, obj.player);
      delete copy.user.email;
      clients[token].clientsDictionary[obj.client].ws.send(
        JSON.stringify({
          method: BEGIN_MATCH,
          player: copy,
          users,
          endTime,
          location: clients[token].location,
        })
      );
    }
    return setTimeout(
      () => endMatch(token),
      endTime.getTime() - new Date().getTime()
    );
  }
};

/**
 * Joins a user to a match.
 * @description The function looks if the user is not already waiting. In case that it is not waiting, the user gets added to connectedClients using its email
 * (or fake email) which references the player, then gets added to clientsDictionary, which references to its WebSocket.
 * @pre Match exists and has not begun.
 * @post User joins the match. All users receive the a message including:
 *  * method: JOIN_MATCH which represents which method was called.
 *  * waitingUsers [User] Array of users that are currently waiting the match to begin.
 * @param {Number} token Token that identifies the match.
 * @param {User} user User to be added to the match.
 * @param {WebSocket} client WebSocket of the user that requested to join the match.
 * @throws {Error} any parameter was not defined.
 * @throws {Error} if the match does not exist.
 * @throws {Error} if the match had already begun.
 * @throws {Error} if the specified user already exists in the match.
 * @throws {Error} if the clients WebSocket exists in the match. In this case the user will be rejoined automatically.
 * @throws {Error} if the match is full (i.e already 12 players waiting).
 */
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
    client.send(JSON.stringify({ method: JOIN_MATCH, joined: true }));
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
      ws.send(JSON.stringify({ method: JOIN_MATCH, waitingUsers }));
    }
  } else
    throw new Error(
      `Not all parameters defined for joinMatch(token = ${token}, user = ${user}, client = ${client})`
    );
};

/**
 * Creates a message inside the chat in a match.
 * @description The function creates a Message object and pushes it to the chat of the match. Then notifies all players about the updated chat.
 * @pre Match exists and has begun.
 * @post Message gets created. All users receive the a message including:
 *  * method: CHAT which represents which method was called.
 *  * chat: [Message] Updated array of Messages.
 *  @param {Number} token Token that identifies the match.
 * @param {String} message Message to add to the chat.
 * @param {User} user User that sent the message.
 * @throws {Error} any parameter  was not specified.
 * @throws {Error} if the match does not exist.
 * @throws {Error} if the match has not begun.
 */
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
        clients[token].chat.push(new Message(user, message));
        const chat = clients[token].chat;
        this.notifyChanges(token, { method: CHAT, chat });
      }
    }
  } else
    throw new Error(
      `Not all parameters defined for chatWithinMatch(token = ${token}, message = ${message}, chattingUser = ${user})`
    );
};

/**
 * Creates a vote in a match.
 * @description The function looks for references in clientsDictionary to find the voting user id using the WebSocket remote ip address. If the user has not voted,
 * the function finds the user role. If its role is "Spy", then the user can only vote for locations and to do so, the idVote must match and mongoDB id of a location.
 * If the location exists, then the vote gets registered for this location and the score updates if necessary (read (at)post). On the other hand, if the role is "Not Spy", then
 * the user can only vote for users and to do so, the idVote must match a users id. If the user exists, then the vote gets registered for this user and the score updates
 * if necessary (read (at)post).
 * @pre Match exists and has begun.
 * @post Vote get registered. If the vote is correct (The spy guessed correctly the location of the others users or The not-spy users guessed correctly a spy user),
 * then the score of the voting user increases by 1 and the score of its role increases by 1 too.
 * Then a message is send to the voting user (ws), including:
 *  * method: CREATE_VOTE to identify which method was called.
 *  * voted: true || false. True if the vote was successful or false if it was not (due to any error listed below).
 * @param {Number} token Token that identifies the match.
 * @param {String} idVote Id of the user or the location of the vote.
 * @param {WebSocket} ws The websocket (therefore, the user) that requested to do the vote.
 * @throws {Error} any parameter  was not specified.
 * @throws {Error} if the match does not exist.
 * @throws {Error} if the match has not begun.
 * @throws {Error} if the user has already voted.
 * @throws {Error} if voting user (represented by its WebSocket) does not belong to the match.
 * @throws {Error} if the voting user doesn't have any role (highly unlikely due to match's flow).
 */
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
      if (clients[token].ended) throw new Error("Match already ended");
      let idVotingUser =
        clients[token].clientsDictionary[ws._socket.remoteAddress].id;
      let idEmail =
        clients[token].clientsDictionary[ws._socket.remoteAddress].email;
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
            if (clients[token].location._id + "" == idVote) {
              clients[token].spies[idVotingUser].player.user.score += 1;
              clients[token].connectedClients[idEmail].player.user.score += 1;
              clients[token].score.spies += 1;
            }
            find = true;
          }
          return find
            ? ws.send(JSON.stringify({ method: CREATE_VOTE, voted: true }))
            : ws.send(JSON.stringify({ method: CREATE_VOTE, voted: false }));
        //Not spies vote for players
        case NOT_SPY_ROLE:
          let found = false;
          if (clients[token].spies[idVote]) {
            found = true;
            if (!clients[token].notSpies[idVotingUser])
              throw new Error("Spies are not allowed to vote on players");
            if (clients[token].notSpies[idVotingUser].player.user.score) {
              clients[token].notSpies[idVotingUser].player.user.score += 1;
            } else clients[token].notSpies[idVotingUser].player.user.score = 1;
            clients[token].spies[idVote].player.votes += 1;
            clients[token].score.notSpies += 1;
            clients[token].connectedClients[idEmail].player.user.score += 1;
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
          return found
            ? ws.send(JSON.stringify({ method: CREATE_VOTE, voted: true }))
            : ws.send(JSON.stringify({ method: CREATE_VOTE, voted: false }));

        default:
          throw new Error("Player's role not defined");
      }
    }
  } else
    throw new Error(
      `Not all parameters defined for createVote(token = ${token}, idVote = ${idVote}, ws = ${ws})`
    );
};

/**
 * Ends the match with the token received as parameter.
 * @description The function looks for which role had the most points and assign all players for that role into winners array and scoreboard
 * array and then adds the other role to scoreboards array. Moreover, if a user has a _id attribute, then it exists in the database and
 * therefore is actual score (from connectedClients) must be updated in the database.
 * @pre Match exists and has not ended
 * @post Match ends, clients within that match receive a message through the WebSocket including:
 *  * method: END_MATCH to represent which method was called.
 *  * ended: true to represent that the match's status changed.
 *  * scoreboard: [{avatar, id,name,score}] which is an Array of Users (with name, avatar, score) with final match's score.
 *  * winnerRole: "Spies" || "Not Spies" depending on which role had the most points.
 *  * winners: [{avatar, id,name,score}] which is an Array of Users (with name, avatar, score) with the users that belong to the winning role.
 *  * score: {spies: <Integer>, notSpies: <Integer>} which represents final score based on roles.
 * @param  {Number} token Token that identifies the match
 * @throws Error if parameter token was not specified.
 * @throws Error if the match does not exist.
 * @throws Error if the match has not begun.
 */
const endMatch = (token) => {
  if (token) {
    if (!clients[token]) throw new Error("Match not found");
    if (!clients[token].spies || !clients[token].notSpies)
      throw new Error("Match has not begun. Therefore ending it is prohibited");
    if (clients[token].ended) {
      this.notifyChanges(token, {
        method: "END_MATCH",
        ended: true,
        msg: "Already ended",
      });
    } else {
      clients[token].ended = true;
      let scoreboard = [];
      let players = [];
      for (const [emailId, { client, player }] of Object.entries(
        clients[token].connectedClients
      )) {
        if (player.user._id) {
          const userObj = Object.assign({}, player.user);
          delete userObj._id;
          delete userObj.id;
          db.findAndUpdateOnePromise(
            dbName,
            usersCollection,
            player.user._id,
            userObj
          );
        }
      }
      let winners = [];
      let winnerRole =
        clients[token].score.spies >= clients[token].score.notSpies
          ? "Spies"
          : "Not Spies";

      for (const [id, { client, player }] of Object.entries(
        clients[token].spies
      )) {
        const copyOfPlayer = _.cloneDeep(player);
        copyOfPlayer.user._id && delete copyOfPlayer.user._id;
        if (winnerRole === "Spies") {
          winners.push(copyOfPlayer.user);
        }
        scoreboard.push(copyOfPlayer.user);
        players.push(copyOfPlayer);
      }
      for (const [id, { client, player }] of Object.entries(
        clients[token].notSpies
      )) {
        const copyOfPlayer = _.cloneDeep(player);
        copyOfPlayer.user._id && delete copyOfPlayer.user._id;
        if (winnerRole === "Not Spies") {
          winners.push(copyOfPlayer.user);
        }
        scoreboard.push(copyOfPlayer.user);
        players.push(copyOfPlayer);
      }

      let score = clients[token].score;
      console.log(clients[token]);
      let location = clients[token].location;
      this.notifyChanges(token, {
        method: "END_MATCH",
        ended: true,
        winnerRole,
        winners,
        scoreboard,
        score,
        players,
        location,
      });
    }
  } else {
    throw new Error(
      `Not all parameters defined for endMatch(token = ${token})`
    );
  }
};

//#region Utilities
////////////////////////////

//   Utilities

////////////////////////////
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

//#endregion Utilities
