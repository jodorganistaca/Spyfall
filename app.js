const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const express_session = require("express-session");
const methodOverride = require("method-override");
const dotenv = require("dotenv");
dotenv.config();

const indexRouter = require("./routes/index");
const userRouter = require("./routes/users");
const matchRouter = require("./routes/matches");
const authRouter = require("./routes/auth");
const locationRouter = require("./routes/locations");
const questionRouter = require("./routes/questions");
const playerRouter = require("./routes/players");

const { passportInit } = require("./middleware/passportInit");
const passport = require("passport");
const cors = require("cors");
const app = express();

const sessionParser = express_session({
  secret: "process.env.JWT_SECRET",
  resave: true,
  saveUninitialized: true,
  duration: 365 * 24 * 60 * 60 * 1000,
});

passportInit();
app.use(sessionParser);

app.use(
  cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/matches", matchRouter);
app.use("/players", playerRouter);
app.use("/questions", questionRouter);
app.use("/locations", locationRouter);

module.exports = { app, sessionParser };
