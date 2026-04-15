import axios from 'axios';

let getAccessToken = () => null;
let setAccessToken = () => {};

export const injectAuthHelpers = (getter, setter) => {
  getAccessToken = getter;
  setAccessToken = setter;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // required to send httpOnly cookies
});

// Attach token from memory to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If it's 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.data.accessToken;
        
        // Update in memory using the injected setter
        setAccessToken(newToken);
        
        // Update the failed request header and retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh failed (e.g., refresh token expired) -> force logout
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
