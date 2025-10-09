import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["authorization"] = `Bearer ${token}`;
    }
    // console.log(token);
    
    return config;
  },
  (error) => Promise.reject(error)
);
export const setupInterceptors = (navigate) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        navigate("/auth");
      }
      return Promise.reject(error);
    }
  );
};

export default api;
