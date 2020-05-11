const { v1: uuidv1 } = require("uuid");
const { Timer } = require("./Timer");
module.exports.Match = class {
  /**
   * Creates a match. By default the starting round is round = 1, chat and votes are empty, scores are zeroes.
   * @param {Array<Player>} players The players that belong to the match.
   * @param {Integer} maxRounds The maximum amount of rounds of the match.
   */
  constructor(players, maxRounds) {
    this.players = players;
    this.maxRounds = maxRounds;
    this.token = uuidv1();
    this.nonSpiesScore = 0;
    this.spiesScore = 0;
    this.round = 1;
    this.chat = [];
    this.votes = [];
    this.pendingToAssign = [];
    this.waiting = true;
    this.timer = new Timer(10000);
  }
};
