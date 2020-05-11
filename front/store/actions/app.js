export const START_PROGRESS_BAR = "START_PROGRESS_BAR";
export const FINISH_PROGRESS_BAR = "FINISH_PROGRESS_BAR";

export const finishProgress = () => ({
  type: FINISH_PROGRESS_BAR,
});

export const startProgress = () => ({
  type: START_PROGRESS_BAR,
});
