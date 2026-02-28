import axios from "axios";

// In production (Vercel), call the same-origin /api/* endpoint.
// This avoids iOS Safari/Brave cookie blocking when frontend+backend are on different domains.
// Vercel routes /api/* to the serverless proxy in /api/[...path].js
const isProd = process.env.NODE_ENV === "production";
const baseURL = isProd
  ? ""
  : process.env.REACT_APP_API_URL || "http://localhost:4000";

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
