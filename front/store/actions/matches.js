import { http } from "../../plugins/axios";
import { Router } from "../../plugins/i18n";
import { setAlert } from "./alert";
import {
  CREATE_MATCH_SUCCESS,
  CREATE_MATCH_FAIL,
  JOIN_MATCH_SUCCESSFUL,
  START_MATCH_SUCCESSFUL,
  BEGIN_MATCH_SUCCESS,
  BEGIN_MATCH_FAIL,
  JOIN_MATCH_SUCCESS,
  JOIN_MATCH_FAIL,
  MESSAGE_RECEIVED,
} from "./types";

export const createMatch = (wss, name) => (dispatch) => {
  try {
    wss.send(JSON.stringify({ method: "MATCH_CREATION", maxRounds: 5, name }));
    console.log(name);
    console.log(wss);
    let token;
    wss.onmessage = (e) => {
      const response = JSON.parse(e.data);
      console.log("create Match ", e);
      if (response["token"]) {
        token = response["token"];
        console.log("create match ", token, " wss ", wss);
        dispatch({
          type: CREATE_MATCH_SUCCESS,
          payload: {
            wss,
            token,
            waitingUsers: response.waitingUsers,
          },
        });
        //wss.close();
      }
    };
    console.log("redirect to waiting room");
    return Router.push("/waiting-room");
  } catch (error) {
    console.log(error);
    return dispatch({
      type: CREATE_MATCH_FAIL,
    });
  }
};

export const joinMatch = (wss, name, token) => (dispatch) => {
  try {
    wss.send(JSON.stringify({ method: "JOIN_MATCH", token, name }));
    wss.onmessage = (e) => {
      const response = JSON.parse(e.data);
      if (!response.error) {
        dispatch({
          type: JOIN_MATCH_SUCCESS,
          payload: {
            wss,
            token,
            waitingUsers: response.waitingUsers,
          },
        });
        return Router.push("/waiting-room");
      } else {
        console.error("error", response.error);
      }
    };
  } catch (error) {
    return dispatch({
      type: JOIN_MATCH_FAIL,
    });
  }
};

export const beginMatch = (wss, token) => (dispatch) => {
  try {
    wss.send(JSON.stringify({ method: "BEGIN_MATCH", token, minimumSpies: 1 }));
    wss.onmessage = (e) => {
      const response = JSON.parse(e.data);
      console.log(e);
      if (!response.error) {
        response.token = token;
        response.wss = wss;
        dispatch({
          type: BEGIN_MATCH_SUCCESS,
          payload: response,
        });
        return Router.push("/play");
      }
      console.error("error", response.error);
    };
  } catch (error) {
    return dispatch({
      type: BEGIN_MATCH_FAIL,
    });
  }
};
