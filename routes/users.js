const express = require("express");
const router = express.Router();
const config = require("config");
const db = require("../db/MongoUtils");
const dbName = config.get("dbName");
const usersCollection = config.get("usersCollection");

router.get("/", function (req, res) {
  db.getDocumentsPromise(dbName, usersCollection).then((docs) =>
    res.json(docs)
  );
});

router.get("/:id", function (req, res) {
  db.findOnePromise(dbName, usersCollection, req.params.id).then((docs) => {
    if (docs && docs[0]) {
      return res.status(200).json(docs[0]);
    } else return res.status(404).json({ msg: "User not found" });
  });
});

module.exports = router;
