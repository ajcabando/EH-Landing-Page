# EH CONNECT Landing Page – static site served with nginx
FROM nginx:1.27-alpine

# Site is deployed under the /EH/ path prefix (all asset URLs use /EH/...)
COPY . /usr/share/nginx/html/EH

# Custom server config (redirects / -> /EH/index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
