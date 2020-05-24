const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const db = require("../db/MongoUtils");
const { User } = require("../db/models/User");
const config = require("config");
const dbName = config.get("dbName");
const usersCollection = config.get("usersCollection");

const passportInit = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        //TODO: Change URL
        callbackURL: "http://localhost:3001/auth/google/callback",
      },
      function (accessToken, refreshToken, profile, cb) {
        console.log("Begiin Google Login");
        let imageUrl = "https://www.twago.es/img/2018/default/no-user.png";
        if (profile.photos && profile.photos.length) {
          imageUrl = profile.photos[0].value;
        }
        //TODO: Encrypt Google id
        let potentialOldUser = { email: profile.emails[0].value };
        db.findOrCreateDocumentPromise(
          dbName,
          usersCollection,
          potentialOldUser,
          new User(profile.emails[0].value, profile.displayName, imageUrl, 0)
        ).then((user) => {
          cb(null, user.value);
        });
      }
    )
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        //TODO: Change URL
        callbackURL: "http://localhost:3001/auth/facebook/callback",
        profileFields: [
          "id",
          "displayName",
          "name",
          "gender",
          "picture.type(large)",
          "email",
        ],
      },
      function (accessToken, refreshToken, profile, cb) {
        let imageUrl = "https://www.twago.es/img/2018/default/no-user.png";
        if (profile.photos && profile.photos.length) {
          imageUrl = profile.photos[0].value;
        }
        //TODO: Encrypt Google id
        let potentialOldUser = new User(
          profile.emails[0].value,
          profile.displayName,
          imageUrl
        );
        Object.keys(potentialOldUser).forEach(
          (key) =>
            potentialOldUser[key] === undefined && delete potentialOldUser[key]
        );
        db.findOrCreateDocumentPromise(
          dbName,
          usersCollection,
          potentialOldUser,
          new User(profile.emails[0].value, profile.displayName, imageUrl, 0)
        ).then((user) => cb(null, user.value));
      }
    )
  );

  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
  });
};
module.exports.passportInit = passportInit;
