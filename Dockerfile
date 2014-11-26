FROM node:0.10-slim

ADD . /usr/src/app
WORKDIR /usr/src/app
RUN npm install

EXPOSE 3000
