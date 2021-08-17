FROM node:alpine

RUN mkdir -p /usr/src/kelime-apiend && chown -R node:node /usr/src/kelime-apiend

WORKDIR /usr/src/kelime-apiend

COPY package.json yarn.lock ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 5001
CMD [ "yarn", "start" ]
