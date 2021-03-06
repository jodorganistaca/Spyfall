import {
  CREATE_MATCH_SUCCESS,
  CREATE_MATCH_FAIL,
  BEGIN_MATCH_SUCCESS,
  BEGIN_MATCH_FAIL,
  JOIN_MATCH_SUCCESS,
  JOIN_MATCH_FAIL,
  MESSAGE_RECEIVED,
  ENDED_MATCH_SUCCESS,
  ERROR,
} from "../actions/types";

const initialState = {
  match: null,
  loading: true,
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case CREATE_MATCH_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        match: payload,
        isOwner: true,
      };
    case CREATE_MATCH_FAIL:
    case JOIN_MATCH_FAIL:
      return {
        ...state,
        match: null,
      };
    case BEGIN_MATCH_SUCCESS:
    case JOIN_MATCH_SUCCESS:
      return {
        ...state,
        matchBegun: true,
        match: payload,
      };
    case BEGIN_MATCH_FAIL:
      return {
        ...state,
        matchBegun: false,
        match: null,
      };
    case MESSAGE_RECEIVED:
      return {
        ...state,
        chat: payload.chat,
      };
    case ENDED_MATCH_SUCCESS:
      const {
        ended,
        winnerRole,
        winners,
        scoreboard,
        score,
        players,
        location,
      } = payload;
      return {
        ...state,
        ended,
        winnerRole,
        winners,
        scoreboard,
        score,
        players,
        location,
      };
    case ERROR:
      return {
        ...state,
        error: payload,
        errorSeverity: "error",
      };
    default:
      return state;
  }
}
