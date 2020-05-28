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
} from "./types";

export const createMatch = (wss, name) => async (dispatch) => {
  try {
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
    };
  } catch (error) {
    console.log(error);
    return dispatch({
      type: CREATE_MATCH_FAIL,
    });
  }
};

export const joinMatch = (wss, name, token) => async (dispatch) => {
  try {
    wss.send(JSON.stringify({ method: "JOIN_MATCH", token, name }));
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
        console.error("error", response.error);
      }
    };
  } catch (error) {
    return dispatch({
      type: JOIN_MATCH_FAIL,
    });
  }
};

export const endMatch = (response) => async (dispatch) => {
  try {
    console.log(response);
    if (!response.error) {
      await dispatch({
        type: ENDED_MATCH_SUCCESS,
        payload: response,
      });
      return Router.push("/publish-votation");
    }
  } catch (error) {
    console.error("error", error);
  }
};

export const beginMatch = (wss, token) => async (dispatch) => {
  try {
    wss.send(JSON.stringify({ method: "BEGIN_MATCH", token, minimumSpies: 1 }));
    wss.onmessage = async (e) => {
      const response = JSON.parse(e.data);
      console.log(response);
      if (!response.error) {
        response.token = token;
        response.wss = wss;
        await dispatch({
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
