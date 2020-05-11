import test from "./test";
import app from "./app";
import auth from "./auth";
import matches from "./matches";
import alert from "./alert";
import { combineReducers } from "redux";

export default combineReducers({
  test,
  app,
  auth,
  alert,
  matches,
});
