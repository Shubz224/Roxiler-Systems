import axios from 'axios';

let getAccessToken = () => null;
let setAccessToken = () => {};

export const injectAuthHelpers = (getter, setter) => {
  getAccessToken = getter;
  setAccessToken = setter;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// inject access token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// response interceptors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // catch 401 error
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // cycle refresh token
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.data.accessToken;
        
        // update token in react context
        setAccessToken(newToken);
        
        // retry req
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        // refresh failed, trigger cleanup
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
