const express = require("express");
const router = express.Router();
const config = require("config");
const db = require("../db/MongoUtils");
const { check, validationResult } = require("express-validator");
const dbName = config.get("dbName");
const matchesCollection = config.get("matchesCollection");
const locationsCollection = config.get("locationsCollection");
const WebSocketUtils = require("../utils/WebSocketUtils");
const { Match } = require("../db/models/Match");
const { Message } = require("../db/models/Message");
const { Timer } = require("../db/models/Timer");
const { Vote } = require("../db/models/Vote");
const _ = require("lodash");

/**
 * GET /matches
 * Returns all matches in the database.
 * @access public
 */
router.get("/", function (req, res) {
  db.getDocumentsPromise(dbName, matchesCollection).then((docs) =>
    res.json(docs)
  );
});

/**
 * GET /matches/testGenerate
 * Returns all matches in the database.
 * @access public
 */
router.get("/testGenerate/:id/:minplayers", function (req, res) {
  try {
    WebSocketUtils.generatePlayers(req.params.id, req.params.minplayers);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ msg: "Match created" });
});

/**
 * GET /matches/testNotify
 * Returns all matches in the database.
 * @access public
 */
router.get("/testGenerate/:id/:minplayers", function (req, res) {
  WebSocketUtils.notifyChanges;
});

/**
 * GET /matches/:id
 * Returns the match associated to the on MongoDB's _id.
 * @access public
 */
router.get("/:id", function (req, res) {
  db.findOnePromise(dbName, matchesCollection, req.params.id).then((docs) => {
    if (docs && docs[0]) {
      return res.status(200).json(docs[0]);
    } else return res.status(404).json({ msg: "Match not found" });
  });
});

/**
 * DELETE /matches/:id
 * Deletes a match based on its MongoDB's _id.
 * Returns the deleted document (MongoDB default).
 * @access public
 */
router.delete("/:id", function (req, res) {
  db.findAndDeleteOnePromise(dbName, matchesCollection, req.params.id).then(
    (docs) => {
      if (docs && docs[0]) {
        return res.status(200).json(docs[0]);
      } else return res.status(404).json({ msg: "Match not found" });
    }
  );
});

/**
 * GET /matches/token/:token
 * Returns a match based on its unique token.
 * @access public
 */
router.get("/token/:token", function (req, res) {
  db.findOneObjectPromise(dbName, matchesCollection, {
    token: req.params.token,
  }).then((docs) => {
    if (docs && docs[0]) {
      return res.status(200).json(docs[0]);
    } else return res.status(404).json({ msg: "Match not found" });
  });
});

/**
 * POST /matches
 * Creates a match.
 * @param maxRounds Body parameter maxRounds. Must be integer > 0.
 * @param Body parameter player. Must be consistent with Player Model.
 * @access public
 */
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
    return res.status(201).json(WebSocketUtils.createMatch(maxRounds));
  }
);

/**
 * PUT /matches/beginMatch/:id
 * Sets match's waiting status to false
 * @access public
 */

//TODO: Assign players
router.put(
  "/beginMatch/:id",
  [
    check(
      "minimumSpies",
      "Minimum number of rounds is required and must be a positive number"
    ).isInt({ gt: 0 }),
  ],
  function (req, res) {
    const { maxRounds } = req.body;
    try {
      WebSocketUtils.generatePlayers(req.params.id, minimumSpies);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ msg: "Match created" });
  }
);

/**
 * PUT /matches/chat/:token
 * Adds a message to the match.
 * @param message Body parameter message. Must be string and not empty.
 * @param player Body parameter player. Must be consistent with Player Model.
 * @access public
 */
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
            WebSocketUtils.notifyChanges(_id, updatedMatch);
            return res.status(200).json(updatedMatch);
          } else return res.status(500).json({ msg: "Server error" });
        });
      } else return res.status(400).json({ msg: "Match not found" });
    });
  }
);

/**
 * PUT /matches/score/:token
 * Updates the score of a match.
 * @param nonSpiesScore Body parameter nonSpiesScore. Must be integer > 0.
 * @param spiesScore Body parameter spiesScore. Must be integer > 0.
 * @access public
 */
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
            WebSocketUtils.notifyChanges(_id, updatedMatch);
          } else return res.status(500).json({ msg: "Server error" });
        });
      } else return res.status(400).json({ msg: "Match not found" });
    });
  }
);

/**
 * POST /matches/createTimer/:token
 * Creates the timer of a round of a match.
 * @param duration Body parameter duration. Must be integer greater than 179999 ms (3 minutes).
 * @access public
 */
router.post(
  "/createTimer/:token",
  [
    check(
      "duration",
      "The duration of the timer must be greater than 3 minutes."
    ).isInt({ gt: 179999 }),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { duration } = req.body;
    db.findOneObjectPromise(dbName, matchesCollection, {
      token: req.params.token,
    }).then((docs) => {
      let updatedMatch;
      if (docs && docs[0]) {
        updatedMatch = docs[0];
        updatedMatch.timer = new Timer(duration);
        const _id = docs[0]._id;
        db.findAndUpdateOnePromise(
          dbName,
          matchesCollection,
          _id,
          updatedMatch
        ).then((docs) => {
          if (docs.ok === 1) {
            WebSocketUtils.notifyChanges(_id, updatedMatch);
            return res.status(201).json(updatedMatch);
          } else return res.status(500).json({ msg: "Server error" });
        });
      } else return res.status(400).json({ msg: "Match not found" });
    });
  }
);
/**
 * POST /matches/createVote/:token
 * Creates a vote in a match.
 * @param votingPlayer Body parameter votingPlayer. Must be consistent with Player Model.
 * @param votedPlayer Body parameter votedPlayer. Must be consistent with Player Model.
 * @param isSpy Body parameter isSpy. Must be boolean.
 * @access public
 */
router.post(
  "/createVote/:token",
  [check("votedPlayer", "The voted user is required.").not().isEmpty()],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { votedPlayer } = req.body;
    db.findOneObjectPromise(dbName, matchesCollection, {
      token: req.params.token,
    }).then((docs) => {
      let updatedMatch;
      if (docs && docs[0]) {
        updatedMatch = docs[0];
        const _id = docs[0]._id;
        let found = false;
        for (let i = 0; i < updatedMatch.players.length; i++) {
          let actualWithVotes = updatedMatch.players[i];
          let actualWithoutVotes = Object.assign({}, actualWithVotes);
          delete actualWithoutVotes.votes;
          if (_.isEqual(actualWithoutVotes, votedPlayer)) {
            if (actualWithVotes.votes) actualWithVotes.votes += 1;
            else actualWithVotes.votes = 1;

            found = true;
            break;
          }
        }
        if (found) {
          db.findAndUpdateOnePromise(
            dbName,
            matchesCollection,
            _id,
            updatedMatch
          ).then((docs) => {
            if (docs.ok === 1) {
              WebSocketUtils.notifyChanges(_id, updatedMatch);
              return res.status(201).json(updatedMatch);
            } else return res.status(500).json({ msg: "Server error" });
          });
        } else return res.status(400).json({ msg: "Voted user not found" });
      } else return res.status(400).json({ msg: "Match not found" });
    });
  }
);
module.exports = router;
