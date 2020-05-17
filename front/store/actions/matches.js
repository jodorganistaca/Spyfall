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
} from "./types";

const getCookie = (cname) => {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

export const createMatch = (user) => async (dispatch) => {
  try {
    const res = await http.post("/matches", {
      withCredentials: true,
      maxRounds: 5,
      headers: {
        "Content-Type": "application/json",
      },
    });
    await http.put(`/matches/join/${res.data.token}`, {
      user,
      headers: {
        "Content-Type": "application/json",
      },
    });
    dispatch({
      type: CREATE_MATCH_SUCCESS,
      payload: res.data,
    });
    console.log("redirect to waiting room");
    return Router.push("/waiting-room");
  } catch (error) {
    return dispatch({
      type: CREATE_MATCH_FAIL,
    });
  }
};

export const joinMatch = (user, code) => async (dispatch) => {
  try {
    const res = await http.put(`/matches/join/${code}`, {
      withCredentials: true,
      user,
      headers: {
        "Content-Type": "application/json",
      },
    });
    dispatch({
      type: JOIN_MATCH_SUCCESS,
      payload: res.data,
    });
    return Router.push("/waiting-room");
  } catch (error) {
    return dispatch({
      type: JOIN_MATCH_FAIL,
    });
  }
};

export const startMatch = (code, user) => async (dispatch) => {
  try {
    const response = await http.put(`/matches/start/${code}`, {
      player: { user },
    });
    return dispatch({ type: START_MATCH_SUCCESSFUL, payload: response.data });
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

export const beginMatch = (matchId) => async (dispatch) => {
  try {
    const res = await http.put(`/matches/beginMatch/${matchId}`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    dispatch({
      type: BEGIN_MATCH_SUCCESS,
      payload: res.data,
    });
    return Router.push("/choose-place");
  } catch (error) {
    return dispatch({
      type: BEGIN_MATCH_FAIL,
    });
  }
};
