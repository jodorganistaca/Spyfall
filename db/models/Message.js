module.exports.Message = class {
<<<<<<< HEAD
  /**
   * Creates a message.
   * @param {Player} player Player that created the message.
   * @param {String} message Message.
   */
=======
>>>>>>> 74802ec... Added API routes for users and matches.
  constructor(player, message) {
    this.player = player;
    this.message = message;
    this.date = Date.now();
  }
};
