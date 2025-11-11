FROM node:20 AS build
WORKDIR /app

# 👇 сначала только зависимости, чтобы кешировалось
COPY package*.json ./
RUN npm ci

# 👇 теперь остальной код
COPY . .

RUN npm run build

FROM nginx:1.27
COPY --from=build /app/build /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

 