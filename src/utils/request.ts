import axios from 'axios';

// 创建 Axios 实例
const request = axios.create({
  baseURL: 'http://localhost:9081', // 确保使用 storage-service 的端口
  timeout: 5000, // 请求超时时间
  withCredentials: true, // 允许跨域携带 Cookie
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // 获取 Token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 在请求头中添加 Token
    }
    return config; // 返回配置
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => response, // 直接返回成功的响应
  (error) => {
    console.error('响应拦截器错误:', error);

    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.error('用户未授权，请重新登录');
        // 跳转到登录页面
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('权限不足，无法访问资源');
      } else if (status === 500) {
        console.error('服务器错误，请稍后重试');
      }
    }

    return Promise.reject(error); // 返回错误
  }
);

export default request;
