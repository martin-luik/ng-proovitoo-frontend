FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build -- --configuration=production

FROM nginx:1.29.1-alpine
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist/ng-proovitoo-frontend/browser/ ./

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80