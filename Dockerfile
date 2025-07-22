FROM nginx:latest

# 复制打包后的前端静态文件到 Nginx 默认目录
COPY ./dist /online/prodect

# 复制你写好的 Nginx 配置文件到容器内
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]