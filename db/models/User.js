module.exports.User = class {
  /**
   * Creates a User (used by Passport).
   * @param {Integer} googleId Associated Google's id of the user.
   * @param {*} name Display name of the user.
   * @param {*} avatar Avatar/image of the user.
   * @param {*} score Global score of the user.
   */
  constructor(googleId, name, avatar, score) {
    this.googleId = googleId;
    this.name = name;
    this.avatar = avatar;
    this.score = score;
  }
};
