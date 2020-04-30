module.exports.Vote = class {
  /**
   * Creates a vote.
   * @param {Player} votingPlayer Player owner/creator of the vote.
   * @param {Player} votedPlayer Player which has been voted as spy/not-spy by the voting player.
   * @param {Boolean} isSpy Boolean that represents if the vote for the votedPlayer is that the player is the spy or not.
   */
  constructor(votingPlayer, votedPlayer, isSpy) {
    this.player = votingPlayer;
    this.votedPlayer = votedPlayer;
    this.isSpy = isSpy;
  }
};
