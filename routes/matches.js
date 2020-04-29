const express = require("express");
const router = express.Router();
const config = require("config");
const db = require("../db/MongoUtils");
const { check, validationResult } = require("express-validator");
const dbName = config.get("dbName");
const matchesCollection = config.get("matchesCollection");
const { Match } = require("../db/models/Match");
const { Message } = require("../db/models/Message");

router.get("/", function (req, res) {
  db.getDocumentsPromise(dbName, matchesCollection).then((docs) =>
    res.json(docs)
  );
});

router.get("/:id", function (req, res) {
  db.findOnePromise(dbName, matchesCollection, req.params.id).then((docs) =>
    res.json(docs)
  );
});

router.post(
  "/",
  [
    check(
      "maxRounds",
      "Maximum number of rounds is required and must be a positive number"
    ).isInt({ gt: 0 }),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(Match);

    const { maxRounds } = req.body;
    db.createOneDocumentPromise(
      dbName,
      matchesCollection,
      new Match([], maxRounds)
    ).then((docs) => res.json(docs));
  }
);

router.put(
  "/join/:token",
  [
    check("player", "User must be authenticated in order to join a match")
      .not()
      .isEmpty(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const player = req.body;
    db.findOneObjectPromise(dbName, matchesCollection, {
      token: req.params.token,
    }).then((docs) => {
      if (docs && docs[0]) {
        const _id = docs[0]._id;
        db.findAndUpdateOnePromise(
          dbName,
          matchesCollection,
          _id,
          docs[0].players.push(player)
        );
      } else return res.status(400).json({ msg: "Match not found" });
    });
  }
);

router.put(
  "/chat/:token",
  [
    check("message", "The message is required").not().isEmpty(),
    check("player", "The player is required").not().isEmpty(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { player, message } = req.body;
    const newMessage = new Message(player, message);
    db.findOneObjectPromise(dbName, matchesCollection, {
      token: req.params.token,
    }).then((docs) => {
      if (docs && docs[0]) {
        const _id = docs[0]._id;
        db.findAndUpdateOnePromise(
          dbName,
          matchesCollection,
          _id,
          docs[0].chat.push(newMessage)
        );
      } else return res.status(400).json({ msg: "Match not found" });
    });
  }
);
module.exports = router;
