import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001'; // FastAPIサーバーのURL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプターでトークンを付与
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // またはAuthContextから取得
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
