const express = require("express");
const router = express.Router();
const config = require("config");
const db = require("../db/MongoUtils");
const { check, validationResult } = require("express-validator");
const dbName = config.get("dbName");
const matchesCollection = config.get("matchesCollection");
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
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { maxRounds } = req.body;
    db.createOneDocumentPromise(
      dbName,
      matchesCollection,
      new Match([], maxRounds)
    ).then((docs) => {
      res.cookie("Spyfall-Match", JSON.stringify({ matchId: docs.ops[0]._id }));
      return res.status(201).json(docs.ops[0]);
    });
  }
);

/**
 * PUT /matches/join/:token
 * Adds a user to the match.
 * @param player Body parameter player. Must be consistent with Player Model.
 * @access public
 */
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
        db.findAndUpdateOnePromise(dbName, matchesCollection, _id, docs[0], {
          $push: {
            players: { user, role, location },
          },
        }).then((docs) => {
          if (docs.ok === 1) {
            updatedMatch.players.push({ user, role, location });
            res.cookie("Spyfall-Match", JSON.stringify({ matchId: _id }));
            return res.status(200).json(updatedMatch);
          } else return res.status(500).json({ msg: "Server error" });
        });
      } else return res.status(400).json({ msg: "Match not found" });
    });
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
  [
    check("votingPlayer", "The user owner of the vote is required.")
      .not()
      .isEmpty(),
    check("votedPlayer", "The voted user is required.").not().isEmpty(),
    check("isSpy", "The vote is required and must be boolean.").isBoolean(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { votingPlayer, votedPlayer, isSpy } = req.body;
    const newVote = new Vote(votingPlayer, votedPlayer, isSpy);
    db.findOneObjectPromise(dbName, matchesCollection, {
      token: req.params.token,
    }).then((docs) => {
      let updatedMatch;
      if (docs && docs[0]) {
        updatedMatch = docs[0];
        const _id = docs[0]._id;
        const isVoted = docs[0].votes.filter((e) => {
          return _.isEqual(e.player, votedPlayer);
        });
        const tempVotingPlayer = { player: votingPlayer };
        let theVote = { player: votingPlayer, votes: [tempVotingPlayer] };
        if (isVoted && isVoted[0]) {
          isVoted[0].votes.push(votingPlayer);
          theVote = isVoted;
          updatedMatch.votes = docs[0].votes.filter(
            (e) => !_.isEqual(e.player, votedPlayer)
          );
          updatedMatch.votes.push(theVote);
          db.findAndUpdateOnePromise(
            dbName,
            matchesCollection,
            _id,
            updatedMatch
          ).then((docs) => {
            if (docs.ok === 1) {
              return res.status(201).json(updatedMatch);
            } else return res.status(500).json({ msg: "Server error" });
          });
        } else {
          db.findAndUpdateOnePromise(dbName, matchesCollection, _id, docs[0], {
            $push: {
              votes: theVote,
            },
          }).then((docs) => {
            if (docs.ok === 1) {
              updatedMatch.votes.push(theVote);
              return res.status(201).json(updatedMatch);
            } else return res.status(500).json({ msg: "Server error" });
          });
        }
      } else return res.status(400).json({ msg: "Match not found" });
    });
  }
);
module.exports = router;
