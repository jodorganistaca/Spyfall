import {
  CREATE_MATCH_SUCCESS,
  CREATE_MATCH_FAIL,
  JOIN_MATCH_SUCCESSFUL,
  START_MATCH_SUCCESSFUL,
  BEGIN_MATCH_SUCCESS,
  BEGIN_MATCH_FAIL,
  JOIN_MATCH_SUCCESS,
  JOIN_MATCH_FAIL,
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
    case JOIN_MATCH_SUCCESSFUL:
      return {
        ...state,
        match: payload,
      };
    case START_MATCH_SUCCESSFUL:
      return {
        ...state,
        match: payload,
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
    default:
      return state;
  }
}
