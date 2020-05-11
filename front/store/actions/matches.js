import { http } from "../../plugins/axios";
import { Router } from "../../plugins/i18n";
import { setAlert } from "./alert";
import { CREATE_MATCH_SUCCESS, CREATE_MATCH_FAIL } from "./types";

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
