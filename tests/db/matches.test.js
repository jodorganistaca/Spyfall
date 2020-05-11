const db = require("../../db/MongoUtils");
const { Match } = require("../../db/models/Match");
const config = require("config");
const dbName = config.get("dbName");
const matchesCollection = config.get("matchesCollection");
describe("Match Model Test", () => {
  it("create & save match successfully", () => {
    const match = new Match([], 5);
    db.createOneDocumentPromise(
      dbName,
      matchesCollection,
      new Match([], 5)
    ).then((docs) => {
      expect(docs[0]._id).toBeDefined();
      expect(docs[0].waiting).toBe(false);
      expect(docs[0].maxRounds).toBe(5);
    });
  });
});
