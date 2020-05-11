import test from "./test";
import auth from "./auth";
import matches from "./matches";
import alert from "./alert";
import { combineReducers } from "redux";

export default combineReducers({
  test,
  auth,
  alert,
  matches,
});
