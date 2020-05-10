import axios from "axios";

export default axios.create({
  baseURL: process.env.BACK_URL,
  timeout: 5000,
});
