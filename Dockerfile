FROM nginx:latest

# 定义构建参数
ARG ENV=dev

# 将打包后的 Vue 项目复制到 Nginx 的默认静态文件路径
COPY ./dist /usr/share/nginx/html

# 根据环境变量选择配置文件
COPY nginx.${ENV}.conf /etc/nginx/conf.d/default.conf

# 暴露 Nginx 的默认端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]