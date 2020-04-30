const express = require("express");
const router = express.Router();
const config = require("config");
const db = require("../db/MongoUtils");
const dbName = config.get("dbName");
const usersCollection = config.get("usersCollection");

/**
 * GET /users
 * Returns all users in the database.
 * @access public
 */
router.get("/", function (req, res) {
  db.getDocumentsPromise(dbName, usersCollection).then((docs) =>
    res.json(docs)
  );
});

/**
 * GET /users/:id
 * Returns the user associated to the on MongoDB's _id.
 * @access public
 */
router.get("/:id", function (req, res) {
  db.findOnePromise(dbName, usersCollection, req.params.id).then((docs) => {
    if (docs && docs[0]) {
      return res.status(200).json(docs[0]);
    } else return res.status(404).json({ msg: "User not found" });
  });
});

/**
 * DELETE /users/:id
 * Deletes a users based on its MongoDB's _id.
 * Returns the deleted document (MongoDB default).
 * @access public
 */
router.delete("/:id", function (req, res) {
  db.findAndDeleteOnePromise(dbName, matchesCollection, req.params.id).then(
    (docs) => {
      if (docs && docs[0]) {
        return res.status(200).json(docs[0]);
      } else return res.status(404).json({ msg: "Location not found" });
    }
  );
});

module.exports = router;
