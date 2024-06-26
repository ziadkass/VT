FROM node:18.19.0

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 5006

CMD ["node", "index.js"]
