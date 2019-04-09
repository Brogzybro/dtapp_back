FROM node:10-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN apk --no-cache add --virtual .gyp python make g++ \
  && npm install yarn -g \
  && yarn install \
  && apk del .gyp

COPY . .
EXPOSE 3000

CMD ["yarn", "start"]
