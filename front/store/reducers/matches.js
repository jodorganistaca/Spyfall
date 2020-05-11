import { CREATE_MATCH_SUCCESS, CREATE_MATCH_FAIL } from "../actions/types";

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
      };
    case CREATE_MATCH_FAIL:
      return {
        ...state,
        match: null,
      };
    default:
      return state;
  }
}
