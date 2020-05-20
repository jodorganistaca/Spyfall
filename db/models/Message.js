module.exports.Message = class {
  /**
   * Creates a message.
   * @param {User} user User that created the message.
   * @param {String} message Message.
   */
  constructor(user, message) {
    this.user = user;
    this.message = message;
    this.date = Date.now();
  }
};
