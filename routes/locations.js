const express = require("express");
const router = express.Router();
const config = require("config");
const db = require("../db/MongoUtils");
const { check, validationResult } = require("express-validator");
const dbName = config.get("dbName");
const locationsCollection = config.get("locationsCollection");
const { Location } = require("../db/models/Location");

/**
 * GET /locations
 * Returns all locations in the database.
 * @access public
 */
/**En index.js tambien tienen un metodo que se activa en la raiz seria bueno poner una ruta diferente para evitar confusiones*/
router.get("/", function (req, res) {
  db.getDocumentsPromise(dbName, locationsCollection).then((docs) =>
    res.json(docs)
  );
});

/**
 * GET /locations/:id
 * Returns the location associated to the on MongoDB's _id.
 * @access public
 */
router.get("/:id", function (req, res) {
  db.findOnePromise(dbName, locationsCollection, req.params.id).then((docs) => {
    if (docs && docs[0]) {
      return res.status(200).json(docs[0]);
    } else return res.status(404).json({ msg: "Location not found" });
  });
});

/**
 * DELETE /locations/:id
 * Deletes a location based on its MongoDB's _id.
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

/**
 * POST /locations
 * Creates a location.
 * @param name Body parameter name. Must be String.
 * @param image Body parameter image. Must be an URL.
 * @access public
 */
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
