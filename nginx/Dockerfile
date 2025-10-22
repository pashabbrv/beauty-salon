FROM nginx:alpine

# Копируем конфигурацию
COPY nginx.conf /etc/nginx/nginx.conf

# Создаем папки для логов и certbot
RUN mkdir -p /var/log/nginx /var/www/certbot /etc/letsencrypt

# Добавляем скрипт для автоматического обновления сертификатов
RUN apk add --no-cache certbot

# Создаем скрипт для обновления сертификатов
RUN echo '#!/bin/sh\n\
certbot renew --webroot --webroot-path=/var/www/certbot\n\
nginx -s reload' > /etc/periodic/daily/certbot-renew && chmod +x /etc/periodic/daily/certbot-renew

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]