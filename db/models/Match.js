const { v1: uuidv1 } = require("uuid");
const { Timer } = require("./Timer");
module.exports.Match = class {
  /**
   * Creates a match. By default the starting round is round = 1, chat and votes are empty, scores are zeroes.
   * @param {Array<WebSocket>} connectedClients The players that belong to the match.
   * @param {Integer} maxRounds The maximum amount of rounds of the match.
   * @param {Integer} token Token of the match. By default, it will be generated with UUID.
   */
  constructor(connectedClients, maxRounds, token = uuidv1()) {
    this.connectedClients = connectedClients;
    this.maxRounds = maxRounds;
    this.token = token;
    this.spies = { players: [], score: 0 };
    this.notSpies = { players: [], score: 0 };
    this.round = 1;
    this.chat = [];
    this.waiting = true;
    this.timer = new Timer(10000);
  }
};
