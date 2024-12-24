import axios from "axios";

// 创建 Axios 实例
const axiosInstance = axios.create({
  baseURL: "http://localhost:9083", // 后端 API 基础 URL
  timeout: 5000, // 请求超时时间
  withCredentials: true, // 允许跨域携带 Cookie
});

// 请求拦截器（用于添加 Token）
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 获取 Token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 添加 Token 到请求头
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
