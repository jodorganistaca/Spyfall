const express = require("express");
const router = express.Router();
const config = require("config");
const db = require("../db/MongoUtils");
const { check, validationResult } = require("express-validator");
const dbName = config.get("dbName");
const locationsCollection = config.get("locationsCollection");
const { Location } = require("../db/models/Location");

router.get("/", function (req, res) {
  db.getDocumentsPromise(dbName, locationsCollection).then((docs) =>
    res.json(docs)
  );
});

router.get("/:id", function (req, res) {
  db.findOnePromise(dbName, locationsCollection, req.params.id).then((docs) => {
    if (docs && docs[0]) {
      return res.status(200).json(docs[0]);
    } else return res.status(404).json({ msg: "Location not found" });
  });
});

router.post(
  "/",
  [
    check("name", "The name of the location is required").not().isEmpty(),
    check("image", "The image of the location must be a URL").isURL(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //TODO: (Front) Upload image to S3, return URL and save it here.
    const { name, image } = req.body;
    db.createOneDocumentPromise(
      dbName,
      locationsCollection,
      new Location(name, image)
    ).then((docs) => res.status(201).json(docs.ops[0]));
  }
);

module.exports = router;
