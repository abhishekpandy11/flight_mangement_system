import axios from "axios";

const getBaseURL = () => {
  const url = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || "https://flight-mangement-system.onrender.com";
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

const API = axios.create({
  baseURL: getBaseURL(),
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
