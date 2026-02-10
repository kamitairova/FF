FROM node:20

WORKDIR /app

# Установить TypeScript глобально
RUN npm install -g typescript

# Копируем package.json
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev)
RUN npm ci --include=dev

# Копируем остальные файлы
COPY . .

# Собираем проект
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]