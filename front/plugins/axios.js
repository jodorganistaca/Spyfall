import axios from "axios";

export default axios.create({
  baseURL: process.env.REACT_APP_BACK_URL,
  timeout: 5000,
});

export const http = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 5000,
});
