import axios from "axios";
import store from "../store";
import { finishProgress, startProgress } from "../store/actions/app";

const Http = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 5000,
});

Http.interceptors.request.use(
  (config) => {
    store.dispatch(startProgress());
    return config;
  },
  (error) => {
    store.dispatch(finishProgress());
    return Promise.reject(error);
  }
);

Http.interceptors.response.use(
  (config) => {
    store.dispatch(finishProgress());
    return config;
  },
  (error) => {
    store.dispatch(finishProgress());
    return Promise.reject(error);
  }
);

export default Http;
