FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd

RUN npm install -g typescript

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]