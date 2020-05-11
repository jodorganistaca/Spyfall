import { FINISH_PROGRESS_BAR, START_PROGRESS_BAR } from "../actions/app";

const initialState = {
  progressBarActive: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FINISH_PROGRESS_BAR:
      return { ...state, progressBarActive: false };
    case START_PROGRESS_BAR:
      return { ...state, progressBarActive: true };
    default:
      return { ...state };
  }
};
