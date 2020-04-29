module.exports.Player = class {
  constructor(user, role, location, anonymous = false) {
    if (anonymous) {
      this.user = {};
      this.user.name = user;
    } else {
      this.user = user;
    }
    this.role = role;
    this.location = location;
  }
};
