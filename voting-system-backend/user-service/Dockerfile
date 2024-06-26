FROM node:18.19.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm rebuild bcrypt --build-from-source


EXPOSE 5002

CMD ["node", "index.js"]
