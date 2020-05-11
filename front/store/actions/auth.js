import http from "../../plugins/axios";
import { setAlert } from "./alert";
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
} from "./types";

import { Router, Route } from "react-router-dom";

export const loadUser = () => async (dispatch) => {
  try {
    const res = await http.get("/auth/getProfile", {
      withCredentials: true,
    });
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

//Logout /Clear Profile
export const logout = () => (dispatch) => {
  dispatch({ type: LOGOUT });
};
