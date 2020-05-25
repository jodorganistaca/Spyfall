module.exports.Location = class {
  /**
   * Creates a Location.
   * @param {String} name Name of the place/location.
   * @param {URL} image Image URL associated to the location.
   * @param {Array<String>} roles Roles available in the location.
   */
  constructor(name, image, roles) {
    this.name = name;
    this.image = image;
    this.roles = roles;
  }
};
