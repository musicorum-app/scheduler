FROM node:12.13-alpine3.9

ENV NODE_ENV production
WORKDIR /usr/src/musicorum-generator/app
COPY ["package.json", "package-lock.json", "./"]

RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 6500
CMD npm start
