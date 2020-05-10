import { APPEND_STRING } from "../actions/test";

export default (state = { test: "Hola " }, action) => {
  console.log(action);
  switch (action.type) {
    case APPEND_STRING:
      return { ...state, test: state.test + action.text };
    default:
      return { ...state };
  }
};
