FROM node:18.19.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5005

CMD ["node", "index.js"]
