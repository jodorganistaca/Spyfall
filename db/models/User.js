module.exports.User = class {
  constructor(googleId, name, avatar, score) {
    this.googleId = googleId;
    this.name = name;
    this.avatar = avatar;
    this.score = score;
  }
};
