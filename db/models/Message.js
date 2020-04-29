module.exports.Message = class {
  constructor(player, message) {
    this.player = player;
    this.message = message;
    this.date = Date.now();
  }
};
