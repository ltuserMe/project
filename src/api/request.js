import axios from "axios";

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // 统一走 Vite 代理
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});


// 请求拦截器
service.interceptors.request.use(
  config => {
    // 自动携带 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 请求错误处理
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 只返回 data，便于后续处理
    return response.data;
  },
  error => {
    // 全局错误处理
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        // token 失效，自动登出并跳转登录
        localStorage.removeItem("token");
        localStorage.removeItem("phone");
        window.location.href = "/login";
      } else if (status === 403) {
        window.$message && window.$message.error("没有权限执行此操作");
      } else if (data && data.error) {
        window.$message && window.$message.error(data.error);
      }
    } else {
      window.$message && window.$message.error("网络异常，请稍后重试");
    }
    return Promise.reject(error);
  }
);

export default service; 