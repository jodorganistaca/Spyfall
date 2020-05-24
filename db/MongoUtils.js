/**
 * MongoDB driver module.
 * @module MongoUtils
 * @author Juan Sebastián Bravo <js.bravo@uniandes.edu.co>
 */

/**
 * @constant MongoClient
 * @type {NodeModule}
 * Loads MongoClient module used to access the MongoDB database
 */
const MongoClient = require("mongodb").MongoClient;

/**
 * @constant uri
 * @type {String}
 * Associated MongoDB Atlas URI.
 */
const uri = process.env.MONGO_URI;

/**
 * @constant client
 * @type {MongoClient}
 * MongoClient.
 */
const client = new MongoClient(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

/**
 * @constant ObjectId
 * @type {NodeModule}
 * Loads ObjectId module to find/update by _id.
 */
const ObjectId = require("mongodb").ObjectID;

/**
 * Returns a list of all databases of the MongoURI.
 * Note: MongoURI user must have admin privileges.
 * @function getDatabasesPromise
 * @alias module:MongoUtils.getDatabasesPromise
 * @throws {Error} if the connection could not be established.
 * @returns {Promise} Promise which will return an object with the databases.
 */
exports.getDatabasesPromise = () => {
  return client.connect().then((client) => client.db().admin().listDatabases());
};

/**
 * Returns a list of all collections in a given database.
 * @function getCollectionPromise
 * @alias module:MongoUtils.getCollectionPromise
 * @param {string} dbName Name of the database to query its collections.
 * @throws {Error} If dbName parameter is null, undefined or is not a string.
 * @throws {Error} If the connection could not be established.
 * @returns {Promise} Promise which will return an array of the databases collections.
 */
exports.getCollectionPromise = (dbName) => {
  if (!dbName || !(dbName instanceof String)) {
    new Error("Database name cannot be: " + dbName);
  }
  return client
    .connect()
    .then((client) => client.db(dbName).listCollections().toArray());
};

/**
 * Returns all documents of a given collection and given database names.
 * @function getDocumentsPromise
 * @alias module:MongoUtils.getDocumentsPromise
 * @param {string} dbName Name of the database to query.
 * @param {string} collectionName Name of the collection to query its documents.
 * @throws {Error} if uri param is null, undefined or is not a string.
 * @throws {Error} if the connection could not be established.
 * @returns {Promise<Array>} A Promise that will return an array with the documents of the collection.
 */
exports.getDocumentsPromise = (dbName, collectionName) => {
  if (!dbName || !(dbName instanceof String)) {
    new Error("Database name cannot be: " + dbName);
  }
  if (!collectionName || !(collectionName instanceof String)) {
    new Error("Collection name cannot be: " + collectionName);
  }
  return client.connect().then((client) =>
    client
      .db(dbName)
      .collection(collectionName)
      .find({})
      .sort({
        _id: -1,
      })
      .toArray()
  );
};

/**
 * @function getRandomDocumentPromise
 * @alias module:MongoUtils.getRandomDocumentPromise
 * @param {string} dbName Name of the database to query.
 * @param {string} collectionName Name of the collection to query its documents.
 * @param {string} size Number of documents required
 * @throws {Error} if uri param is null, undefined or is not a string.
 * @throws {Error} if the connection could not be established.
 * @returns {Promise} A Promise that will return a random document of the collection.
 */
exports.getRandomDocumentPromise = (dbName, collectionName, size = 1) => {
  if (!dbName || !(dbName instanceof String))
    new Error("Database name cannot be: " + dbName);

  if (!collectionName || !(collectionName instanceof String))
    new Error("Collection name cannot be: " + collectionName);

  return client.connect().then((client) =>
    client
      .db(dbName)
      .collection(collectionName)
      .aggregate([{ $sample: { size } }])
      .toArray()
  );
};

/**
 * Deletes a documents by its _id.
 * @function findAndDeleteOnePromise
 * @alias module:MongoUtils.findAndDeleteOnePromise
 * @param {string} dbName Name of the database to query.
 * @param {string} collectionName Name of the collection to query its documents.
 * @param {string} _id The unique _id of the document to be deleted.
 * @throws {Error} if the collection name parameter is null, undefined or is not a string.
 * @throws {Error} if the unique _id parameter is null, undefined or is not a string.
 * @throws {Error} if the connection could not be established.
 * @returns {Promise} A Promise that will return the document deleted.
 */
exports.findAndDeleteOnePromise = (dbName, collectionName, _id) => {
  if (!dbName || !(dbName instanceof String)) {
    new Error("Database name cannot be: " + dbName);
  }
  if (!collectionName || !(collectionName instanceof String)) {
    new Error("Collection name cannot be: " + collectionName);
  }
  if (!_id || !(_id instanceof String)) {
    new Error("The unique _id of the document cannot be: " + _id);
  }

  return client.connect().then((client) =>
    client
      .db(dbName)
      .collection(collectionName)
      .findOneAndDelete({
        _id: new ObjectId(_id),
      })
  );
};

/**
 * Finds and updates one document based on a new object or a set of parameters (such as $push).
 * @function findAndUpdateOnePromise
 * @alias module:MongoUtils.findAndUpdateOnePromise
 * @param {string} dbName Name of the database to query.
 * @param {string} collectionName Name of the collection to query its documents.
 * @param {string} _id The unique _id of the document to be updated.
 * @param {Object} newObject The updated object to set in MongoDB.
 * @param {Object} [parameters] MongoDB parameters (such as $push, $set, etc).
 * @throws {Error} if the collection name parameter is null, undefined or is not a string.
 * @throws {Error} if the unique _id parameter is null, undefined or is not a string.
 * @throws {Error} if the connection could not be established.
 * @returns {Promise} A Promise that will return the non updated object.
 */
exports.findAndUpdateOnePromise = (
  dbName,
  collectionName,
  _id,
  newObject,
  parameters
) => {
  if (!parameters)
    parameters = {
      $set: newObject,
    };
  if (!dbName || !(dbName instanceof String)) {
    new Error("Database name cannot be: " + dbName);
  }
  if (!collectionName || !(collectionName instanceof String)) {
    new Error("Collection name cannot be: " + collectionName);
  }
  if (!_id || !(_id instanceof String)) {
    new Error("The unique _id of the document cannot be: " + _id);
  }
  return client.connect().then((client) =>
    client
      .db(dbName)
      .collection(collectionName)
      .findOneAndUpdate(
        {
          _id: new ObjectId(_id),
        },
        parameters
      )
  );
};

/**
 * Finds and specific documents by its id.
 * @function findOnePromise
 * @alias module:MongoUtils.findOnePromise
 * @param {string} dbName Name of the database to query.
 * @param {string} collectionName Name of the collection to query its documents.
 * @param {string} _id The unique _id of the document to be found.
 * @throws {Error} if the collection name parameter is null, undefined or is not a string.
 * @throws {Error} if the unique _id parameter is null, undefined or is not a string.
 * @throws {Error} if the connection could not be established.
 * @returns {Promise} A Promise that will return the object.
 */
exports.findOnePromise = (dbName, collectionName, _id) => {
  if (!dbName || !(dbName instanceof String)) {
    new Error("Database name cannot be: " + dbName);
  }
  if (!collectionName || !(collectionName instanceof String)) {
    new Error("Collection name cannot be: " + collectionName);
  }
  if (!_id || !(_id instanceof String)) {
    new Error("The unique _id of the document cannot be: " + _id);
  }
  return client.connect().then((client) =>
    client
      .db(dbName)
      .collection(collectionName)
      .find({
        _id: new ObjectId(_id),
      })
      .toArray()
  );
};

/**
 * Finds the documents that match a given object as parameter.
 * @function findOneObjectPromise
 * @alias module:MongoUtils.findOneObjectPromise
 * @param {string} dbName Name of the database to query.
 * @param {string} collectionName Name of the collection to query its documents.
 * @param {string} object The document to be found.
 * @throws {Error} if the collection name parameter is null, undefined or is not a string.
 * @throws {Error} if the unique _id parameter is null, undefined or is not a string.
 * @throws {Error} if the connection could not be established.
 * @returns {Promise} A Promise that will return the object.
 */
exports.findOneObjectPromise = (dbName, collectionName, object) => {
  if (!dbName || !(dbName instanceof String)) {
    new Error("Database name cannot be: " + dbName);
  }
  if (!collectionName || !(collectionName instanceof String)) {
    new Error("Collection name cannot be: " + collectionName);
  }
  return client
    .connect()
    .then((client) =>
      client.db(dbName).collection(collectionName).find(object).toArray()
    );
};

/**
 * Creates a document inside a collection and database given.
 * @function createOneDocumentPromise
 * @alias module:MongoUtils.createOneDocumentPromise
 * @param {string} dbName Name of the database to query.
 * @param {string} collectionName Name of the collection to query its documents.
 * @param {Object} object The object to be inserted in the database.
 * @throws {Error} if the collection name parameter is null, undefined or is not a string.
 * @throws {Error} if the connection could not be established.
 * @returns {Promise} A Promise that will return the object.
 */
exports.createOneDocumentPromise = (dbName, collectionName, object) => {
  if (!dbName || !(dbName instanceof String)) {
    new Error("Database name cannot be: " + dbName);
  }
  if (!collectionName || !(collectionName instanceof String)) {
    new Error("Collection name cannot be: " + collectionName);
  }
  return client
    .connect()
    .then((client) =>
      client.db(dbName).collection(collectionName).insertOne(object)
    );
};

/**
 * Tries to find a document and in case it was not found, it is created.
 * @function findOrCreateDocumentPromise
 * @alias module:MongoUtils.findOrCreateDocumentPromise
 * @param {string} dbName Name of the database to query.
 * @param {string} collectionName Name of the collection to query its documents.
 * @param {Object} searchObject The object to find in the database.
 * @param {Object} insertObject The object to create in the database if searchObject was not found.
 * @throws {Error} if the collection name parameter is null, undefined or is not a string.
 * @throws {Error} if the connection could not be established.
 * @returns {Promise} A Promise that will return the object.
 */
exports.findOrCreateDocumentPromise = (
  dbName,
  collectionName,
  searchObject,
  insertObject
) => {
  return client.connect().then((client) =>
    client.db(dbName).collection(collectionName).findOneAndUpdate(
      searchObject,
      {
        $setOnInsert: insertObject,
      },
      {
        returnOriginal: false,
        upsert: true,
      }
    )
  );
};
/**
 * Returns atomic changes in the collection specified.
 * @function listenForChanges
 * @alias module:MongoUtils.listenForChanges
 * @param {string} dbName Name of the database to query.
 * @param {string} collectionName Name of the collection to watch its documents.
 * @param {Function} callback The function to be called with the _id of the modified document and the full document.
 * @returns {Function} The callback received as parameter.
 */
exports.listenForChanges = (dbName, collectionName, callback) => {
  try {
    client.connect().then((client) => {
      const cursor = client
        .db(dbName)
        .collection(collectionName)
        .watch({ fullDocument: "updateLookup" });

      cursor.on("change", (data) => {
        const _id = data.fullDocument._id;
        this.findOnePromise(dbName, collectionName, _id).then((docs) => {
          if (data && data.updateDescription) {
            docs[0].updatedField = Object.getOwnPropertyNames(
              data.updateDescription.updatedFields
            )[0].split(".")[0];
            return callback(_id, JSON.stringify(docs[0]));
          }
        });
      });
    });
  } catch (error) {
    console.error(error);
  }
};
