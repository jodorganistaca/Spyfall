module.exports.Message = class {
  /**
   * Creates a message.
   * @param {Player} player Player that created the message.
   * @param {String} message Message.
   */
  constructor(player, message) {
    this.player = player;
    this.message = message;
    this.date = Date.now();
  }
};
