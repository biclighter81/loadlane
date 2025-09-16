# Multi-stage build für Entwicklung
FROM node:alpine AS build
WORKDIR /app

# Installiere pnpm global
RUN npm install -g pnpm

# Kopiere nur package.json und lock-Datei für effizienteres Caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# JQ
ENV JQ_VERSION=1.6
RUN wget --no-check-certificate https://github.com/stedolan/jq/releases/download/jq-${JQ_VERSION}/jq-linux64 -O /tmp/jq-linux64
RUN cp /tmp/jq-linux64 /usr/bin/jq
RUN chmod +x /usr/bin/jq
# Kopiere den Rest des Projekts
COPY . .
# Setze Umgebungsvariablen
RUN jq 'to_entries | map_values({ (.key) : ("$" + .key) }) | reduce .[] as $item ({}; . + $item)' ./src/config.json > ./src/config.tmp.json && mv ./src/config.tmp.json ./src/config.json
# Baue die Anwendung
RUN pnpm build

# Produktions-Image
FROM nginx

# Kopiere nur die gebauten Dateien vom Build-Image
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./start-nginx.sh /usr/bin/start-nginx.sh
RUN chmod +x /usr/bin/start-nginx.sh
ENV JSFOLDER="/usr/share/nginx/html/assets/*.js /usr/share/nginx/html/*.html"
# Kopiere die nginx Konfiguration für Docker
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port 80 exponieren
EXPOSE 80

# Starte Nginx im Vordergrund
ENTRYPOINT [ "start-nginx.sh" ]