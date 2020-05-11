module.exports.Timer = class {
  /**
   * Creates a Timer.
   * @param {Integer} duration Duration of the timer in minutes.
   */
  constructor(duration) {
    const date = Date.now();
    this.begins = date;
    this.ends = date + this.minutesToMilliseconds(duration);
  }

  minutesToMilliseconds(time) {
    return time * 60000;
  }
};
