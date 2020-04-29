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
  db.findOnePromise(dbName, matchesCollection, req.params.id).then((docs) => {
    if (docs && docs[0]) {
      return res.status(200).json(docs[0]);
    } else return res.status(404).json({ msg: "Match not found" });
  });
});

router.get("/token/:token", function (req, res) {
  db.findOneObjectPromise(dbName, matchesCollection, {
    token: req.params.token,
  }).then((docs) => {
    if (docs && docs[0]) {
      return res.status(200).json(docs[0]);
    } else return res.status(404).json({ msg: "Match not found" });
  });
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
    const { maxRounds } = req.body;
    db.createOneDocumentPromise(
      dbName,
      matchesCollection,
      new Match([], maxRounds)
    ).then((docs) => res.status(201).json(docs.ops[0]));
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
    const { player } = req.body;
    const { user, role, location } = player;
    if (!user || !role || !location) {
      return res.status(400).json({ msg: "Bad Request" });
    }
    db.findOneObjectPromise(dbName, matchesCollection, {
      token: req.params.token,
    }).then((docs) => {
      let updatedMatch;
      if (docs && docs[0]) {
        updatedMatch = docs[0];
        const _id = docs[0]._id;
        console.log(player);
        console.log(user, role, location);
        db.findAndUpdateOnePromise(dbName, matchesCollection, _id, docs[0], {
          $push: {
            players: { user, role, location },
          },
        }).then((docs) => {
          if (docs.ok === 1) {
            updatedMatch.players.push({ user, role, location });
            return res.status(200).json(updatedMatch);
          } else return res.status(500).json({ msg: "Server error" });
        });
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
      let updatedMatch;
      if (docs && docs[0]) {
        updatedMatch = docs[0];
        const _id = docs[0]._id;
        db.findAndUpdateOnePromise(dbName, matchesCollection, _id, docs[0], {
          $push: {
            chat: newMessage,
          },
        }).then((docs) => {
          if (docs.ok === 1) {
            updatedMatch.chat.push(newMessage);
            return res.status(200).json(updatedMatch);
          } else return res.status(500).json({ msg: "Server error" });
        });
      } else return res.status(400).json({ msg: "Match not found" });
    });
  }
);

router.put(
  "/score/:token",
  [
    check(
      "nonSpiesScore",
      "Non Spies Score is required and must be a positive integer"
    ).isInt({ gt: 0 }),
    check(
      "spiesScore",
      "Spies Score is required and must be a positive integer"
    ).isInt({ gt: 0 }),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { spiesScore, nonSpiesScore } = req.body;
    db.findOneObjectPromise(dbName, matchesCollection, {
      token: req.params.token,
    }).then((docs) => {
      let updatedMatch;
      if (docs && docs[0]) {
        updatedMatch = docs[0];
        updatedMatch.nonSpiesScore = nonSpiesScore;
        updatedMatch.spiesScore = spiesScore;
        const _id = docs[0]._id;
        db.findAndUpdateOnePromise(
          dbName,
          matchesCollection,
          _id,
          updatedMatch
        ).then((docs) => {
          if (docs.ok === 1) {
            return res.status(200).json(updatedMatch);
          } else return res.status(500).json({ msg: "Server error" });
        });
      } else return res.status(400).json({ msg: "Match not found" });
    });
  }
);
module.exports = router;
