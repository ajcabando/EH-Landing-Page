# EH CONNECT Landing Page – static site served with nginx
FROM nginx:1.27-alpine

# Site is served at the root path (all asset URLs are root-relative, e.g. /css/style.css)
COPY . /usr/share/nginx/html
RUN chmod -R a+rX /usr/share/nginx/html

# Custom server config (serves at /, redirects old /EH/... URLs to root)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
