module.exports.Vote = class {
  constructor(votingUser, votedUser, isSpy) {
    this.user = votingUser;
    this.votedUser = votedUser;
    this.isSpy = isSpy;
  }
};
