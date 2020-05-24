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

export const createMatch = (wss,name) => async (dispatch) => {
  try {
    wss.send(
      JSON.stringify({ method: "MATCH_CREATION", maxRounds: 5, name })
    );
    console.log(name);
    console.log(wss);
    let token;
    wss.onmessage = (e) => {
      const response = JSON.parse(e.data);
      console.log(e.data);
      if (response["Match token"]) {
        token = response["Match token"];
        const ws = Object.assign(wss);
        console.log("create match ", token, " wss ", typeof(wss), " ", ws);
        dispatch({
          type: CREATE_MATCH_SUCCESS,
          payload: {
            wss,
            token,
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

export const joinMatch = (wss,name,token) => async (dispatch) => {
  try {
    console.log(name, token);
    console.log(wss);
    wss.send(JSON.stringify({method: "JOIN_MATCH", token, name}));
    console.log(name);
    console.log(wss);
    wss.onmessage = (e) => {
      const response = JSON.parse(e.data);
      console.log(response);
      console.log("aaaah", response.waitingUsers);
      dispatch({
        type: JOIN_MATCH_SUCCESS,
        payload: {
          wss,
          token,
          waitingUsers: response.waitingUsers
        },
      });
    };      
    console.log("redirect to waiting room");
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

export const beginMatch = (wss, token) => async (dispatch) => {
  try {
    console.log("wss ", wss, " token ", token);
    wss.send(JSON.stringify({method: "BEGIN_MATCH", token, minimumSpies: 1}));
    wss.onmessage = (e) =>{
      console.log(e);
      dispatch({
        type: BEGIN_MATCH_SUCCESS,
        payload: res.data,
      });
    } 
    /*const res = await http.put(`/matches/beginMatch/${matchId}`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });*/
    
    return Router.push("/choose-place");
  } catch (error) {
    return dispatch({
      type: BEGIN_MATCH_FAIL,
    });
  }
};
