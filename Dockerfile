FROM nginx:latest

# 定义构建参数
ARG ENV=dev

# 将打包后的 Vue 项目复制到 Nginx 的默认静态文件路径
COPY ./dist /usr/share/nginx/html

# 先把所有环境的配置文件都复制进镜像
COPY nginx.dev.conf /etc/nginx/conf.d/nginx.dev.conf
COPY nginx.prod.conf /etc/nginx/conf.d/nginx.prod.conf

# 根据构建参数选择配置文件
RUN cp /etc/nginx/conf.d/nginx.${ENV}.conf /etc/nginx/conf.d/default.conf \
    && rm /etc/nginx/conf.d/nginx.dev.conf /etc/nginx/conf.d/nginx.prod.conf

# 暴露 Nginx 的默认端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]