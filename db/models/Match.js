const { v1: uuidv1 } = require("uuid");
const { Timer } = require("./Timer");
const db = require("../MongoUtils");
const config = require("config");
const dbName = config.get("dbName");
const locationsCollection = config.get("locationsCollection");
module.exports.Match = class {
  /**
   * Creates a match. By default the starting round is round = 1, chat and votes are empty, scores are zeroes.
   * @param {Array<WebSocket>} connectedClients The players that belong to the match.
   * @param {Integer} maxRounds The maximum amount of rounds of the match.
   * @param {Integer} token Token of the match. By default, it will be generated with UUID.
   */
  constructor(connectedClients, maxRounds, token = uuidv1()) {
    return this.getRandomLocation().then((docs) => {
      this.connectedClients = connectedClients;
      this.maxRounds = maxRounds;
      this.token = token;
      this.spies = { players: [], score: 0 };
      this.notSpies = { players: [], score: 0 };
      this.round = 1;
      this.chat = [];
      this.waiting = true;
      this.usersWhoVoted = [];
      this.allLocations = docs[0];
      this.location = docs[1];
      this.timer = new Timer(10000);
      return this;
    });
  }

  getRandomLocation() {
    return db.getDocumentsPromise(dbName, locationsCollection).then((docs) => {
      let randomLocation = Object.assign(
        {},
        docs[Math.floor(docs.length * Math.random())]
      );
      docs.forEach((element) => {
        element.votes = 0;
      });
      return [docs, randomLocation];
    });
  }
};
