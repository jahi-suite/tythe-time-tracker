# Kari Suite main site — static HTML for karisuite.com / www.karisuite.com
FROM nginx:alpine

COPY . /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
