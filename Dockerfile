# Установите базовый образ
FROM node:latest

# Установите рабочую директорию в контейнере
WORKDIR /app

# Копируйте файлы package.json и package-lock.json
COPY package*.json ./

# Установите зависимости
RUN npm install

# Копируйте остальные файлы проекта
COPY . .

# Компиляция TypeScript в JavaScript
RUN npx tsc --p 'tsconfig.json'

# Запуск приложения
CMD [ "node", "dist/index.js" ]