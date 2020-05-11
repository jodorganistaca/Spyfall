import http from "../../plugins/axios";
import { Router } from "../../plugins/i18n";

import {
  CREATE_MATCH_SUCCESS,
  CREATE_MATCH_FAIL,
  JOIN_MATCH_SUCCESSFUL,
} from "./types";

export const createMatch = () => async (dispatch) => {
  try {
    const res = await http.post("/matches", {
      withCredentials: true,
      maxRounds: 5,
      headers: {
        "Content-Type": "application/json",
      },
    });
    dispatch({
      type: CREATE_MATCH_SUCCESS,
      payload: res.data,
    });
    return Router.push("/waiting-room");
  } catch (error) {
    return dispatch({
      type: CREATE_MATCH_FAIL,
    });
  }
};

export const joinMatch = (code, user) => async (dispatch) => {
  try {
    const response = await http.put(`/matches/join/${code}`, {
      player: { user },
    });
    console.log(response);
    return dispatch({ type: JOIN_MATCH_SUCCESSFUL, payload: response.data });
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

export const startMatch = (code) => async (dispatch) => {};
