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

import { Router } from "../../plugins/i18n";

export const loadUser = () => async (dispatch) => {
  try {
    const res = await http.get("http://spyfall.ml:3001/auth/getProfile", {
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
  Router.push("/");
};
