module.exports.Location = class {
  /**
   * Creates a Location.
   * @param {String} name Name of the place/location.
   * @param {URL} image Image URL associated to the location.
   */
  constructor(name, image) {
    this.name = name;
    this.image = image;
  }
};
