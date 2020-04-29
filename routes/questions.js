const express = require("express");
const router = express.Router();
const config = require("config");
const db = require("../db/MongoUtils");
const { check, validationResult } = require("express-validator");
const dbName = config.get("dbName");
const questionsCollection = config.get("questionsCollection");
const { Question } = require("../db/models/Question");

router.get("/", function (req, res) {
  db.getDocumentsPromise(dbName, questionsCollection).then((docs) =>
    res.json(docs)
  );
});

router.get("/:id", function (req, res) {
  db.findOnePromise(dbName, questionsCollection, req.params.id).then((docs) => {
    if (docs && docs[0]) {
      return res.status(200).json(docs[0]);
    } else return res.status(404).json({ msg: "Question not found" });
  });
});

router.post(
  "/",
  [check("question", "The question is required").not().isEmpty()],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { question } = req.body;
    db.createOneDocumentPromise(
      dbName,
      questionsCollection,
      new Question(question)
    ).then((docs) => res.status(201).json(docs.ops[0]));
  }
);

module.exports = router;
