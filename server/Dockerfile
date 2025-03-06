# Stage 1: Build stage
FROM node:22.14.0 AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Production stage (Nginx)
FROM nginx:latest

# Копируем собранные файлы из стадии build в директорию Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Открываем порт 80
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
