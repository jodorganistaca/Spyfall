const { v1: uuidv1 } = require("uuid");
const { Timer } = require("./Timer");
module.exports.Match = class {
  constructor(players, maxRounds) {
    this.players = players;
    this.maxRounds = maxRounds;
    this.token = uuidv1();
    this.nonSpiesScore = 0;
    this.spiesScore = 0;
    this.round = 1;
    this.chat = [];
    this.votes = [];
    this.timer = new Timer(10000);
  }
};
