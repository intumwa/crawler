FROM node:17-alpine

FROM mcr.microsoft.com/playwright:focal

RUN mkdir -p /usr/app
WORKDIR /usr/app

ENV PATH /usr/app/node_modules/.bin:$PATH
COPY . .

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get -y install libnss3 libatk-bridge2.0-0 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libatspi2.0-0 libxshmfence-dev

CMD sleep 40 && /wait && node app.js
