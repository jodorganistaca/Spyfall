module.exports.Timer = class {
  constructor(duration) {
    const date = Date.now();
    this.begins = date;
    this.ends = date + duration;
  }
};
