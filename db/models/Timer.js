module.exports.Timer = class {
  /**
   * Creates a Timer.
   * @param {Integer} duration Duration of the timer.
   */
  constructor(duration) {
    const date = Date.now();
    this.begins = date;
    this.ends = date + duration;
  }
};
