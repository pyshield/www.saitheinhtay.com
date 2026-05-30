FROM node:20-alpine

RUN apk add --no-cache wget

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npm run compile

COPY docker/deploy-and-exit.sh /app/docker/deploy-and-exit.sh
RUN chmod +x /app/docker/deploy-and-exit.sh

EXPOSE 8545
