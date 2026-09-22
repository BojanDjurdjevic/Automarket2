import axios from "axios";
import { authStore } from "../store/auth.store";
import { hideLoading, showLoading } from "../ui/layouts/Overlay";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8000" : window.location.origin),
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    }
})

export async function getCsrfCooke() {
    await api.get('sanctum/csrf-cookie')
}

api.defaults.xsrfCookieName = 'XSRF-TOKEN';
api.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

api.interceptors.request.use(config => {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    if (token) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    }
    
    showLoading();

    return config;
}); 

api.interceptors.response.use(
  res => {
    hideLoading();
    return res;
  },
  err => {
    hideLoading();
    if (err?.response?.status === 401) authStore.setUser(null);
    return Promise.reject(err);
  }
);