import axios from 'axios';
import { toast } from '../components/custom/sonner';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8082/api",
    withCredentials: false,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_key || 'token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use(
  (response) => {
    if (response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },

  (error) => {
    toast.fromError(error); 
    return Promise.reject(error);
  }
);
export default api;
