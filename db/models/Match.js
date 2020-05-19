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
  constructor(
    connectedClients,
    clientsDictionary,
    maxRounds,
    token = uuidv1()
  ) {
    return this.getRandomLocation().then((docs) => {
      let tempLocations = {};
      docs[0].forEach((element) => {
        tempLocations[element._id] = {
          name: element.name,
          image: element.image,
          votes: element.votes,
        };
      });
      this.connectedClients = connectedClients;
      this.maxRounds = maxRounds;
      this.clientsDictionary = clientsDictionary;
      this.token = token;
      this.spies = {};
      this.notSpies = {};
      this.score = { spies: 0, notSpies: 0 };
      this.round = 1;
      this.chat = [];
      this.waiting = true;
      this.usersWhoVoted = [];
      this.allLocations = tempLocations;
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
