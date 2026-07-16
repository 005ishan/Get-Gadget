import axios from "axios";

const base =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5050/api";

const api = axios.create({
  baseURL: base,
  withCredentials: true,
});

export default api;
