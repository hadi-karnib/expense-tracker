import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL,
  withCredentials: true, // required for httpOnly cookie auth
  headers: {
    "Content-Type": "application/json",
  },
});

export function isAxiosError(err) {
  return !!(err && err.isAxiosError);
}
