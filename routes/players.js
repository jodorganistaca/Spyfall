const express = require("express");
const router = express.Router();
const config = require("config");
const db = require("../db/MongoUtils");
const dbName = config.get("dbName");
const { check, validationResult } = require("express-validator");
const { User } = require("../db/models/User");
const { Player } = require("../db/models/Player");
/**
 * POST /players
 * Returns a JSON with the player. (Does not store it!)
 * @param [name] Body parameter name. The name of the anonymous player.
 * @param [image] Body parameter image. The URL of the image of the user.
 * @param role Body parameter role. Role of the user.
 * @param location Body parameter location. Location of the user.
 * @access public
 */
router.post(
  "/",
  [
    check("role", "The role of the player is required.").not().isEmpty(),
    check("location", "The location of the player is required.")
      .not()
      .isEmpty(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, image, role, location } = req.body;
    if (req.user) {
      const { email, name, avatar } = req.user;
      const newUser = new User(email, name, avatar);
      const newPlayer = new Player(newUser, role, location);
      return res.status(200).json(newPlayer);
    } else {
      if (!name) {
        return res
          .status(400)
          .json({ msg: "Name is required for anonymous users" });
      }
      const newUser = new User(
        null,
        name,
        image || "https://www.twago.es/img/2018/default/no-user.png",
        0
      );
      const newPlayer = new Player(newUser, role, location);
      return res.status(200).json(newPlayer);
    }
  }
);

module.exports = router;
