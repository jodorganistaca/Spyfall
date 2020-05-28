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
  ENDED_MATCH_SUCCESS,
  ERROR,
} from "./types";

export const createMatch = (wss, name) => async (dispatch) => {
  wss.send(JSON.stringify({ method: "MATCH_CREATION", maxRounds: 5, name }));
  let token;
  wss.onmessage = async (e) => {
    const response = JSON.parse(e.data);
    console.log(response);
    if (response["token"]) {
      token = response["token"];
      await dispatch({
        type: CREATE_MATCH_SUCCESS,
        payload: {
          wss,
          token,
          waitingUsers: response.waitingUsers,
        },
      });
      console.log("redirect to waiting room");
      return Router.push("/waiting-room");
    }
    return dispatch({
      type: ERROR,
      payload: response.error,
    });
  };
};

export const joinMatch = (wss, name, token) => async (dispatch) => {
  let asNumber = new Number(token);
  if (isNaN(asNumber)) {
    return dispatch({
      type: ERROR,
      payload: "The token must be a number",
    });
  }
  wss.send(JSON.stringify({ method: "JOIN_MATCH", token: asNumber, name }));
  wss.onmessage = async (e) => {
    const response = JSON.parse(e.data);
    console.log(response);
    if (!response.error) {
      await dispatch({
        type: JOIN_MATCH_SUCCESS,
        payload: {
          wss,
          token,
          waitingUsers: response.waitingUsers,
        },
      });
      return Router.push("/waiting-room");
    } else {
      return dispatch({
        type: ERROR,
        payload: response.error,
      });
    }
  };
};

export const endMatch = (response) => async (dispatch) => {
  console.log(response);
  if (!response.error) {
    await dispatch({
      type: ENDED_MATCH_SUCCESS,
      payload: response,
    });
    return Router.push("/publish-votation");
  }
  return dispatch({
    type: ERROR,
    payload: response.error,
  });
};

export const beginMatch = (wss, token) => async (dispatch) => {
  wss.send(JSON.stringify({ method: "BEGIN_MATCH", token, minimumSpies: 1 }));
};

export const beginMatchNonOwner = (response) => async (dispatch) => {
  if (!response.error) {
    response.token = token;
    response.wss = wss;
    await dispatch({
      type: BEGIN_MATCH_SUCCESS,
      payload: response,
    });
    return Router.push("/play");
  }
  return dispatch({
    type: ERROR,
    payload: response.error,
  });
};
