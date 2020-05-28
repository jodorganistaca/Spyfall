module.exports.User = class {
  /**
   * Creates a User (used by Passport).
   * @param {String} email Associated Google's or Facebook's primary email of the user.
   * @param {String} name Display name of the user.
   * @param {URL} avatar Avatar/image of the user.
   * @param {Integer} score Global score of the user.
   */
  constructor(
    email,
    name,
    avatar = "https://www.twago.es/img/2018/default/no-user.png",
    score
  ) {
    this.email = email;
    this.name = name;
    this.avatar = avatar;
    this.score = score;
  }
};
