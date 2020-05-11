module.exports.Player = class {
  /**
   * Creates a Player
   * @param {User} user User associated to the player of the match.
   * @param {String} role Role of the user.
   * @param {Location} location Location of the user.
   * @param {Boolean} votes Votes of the user.
   */
  constructor(user, role, location) {
    this.user = user;
    this.role = role;
    this.location = location;
    this.votes = 0;
  }
};
