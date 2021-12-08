FROM node:alpine

RUN mkdir -p /usr/src/apiend && chown -R node:node /usr/src/apiend

WORKDIR /usr/src/apiend

COPY package.json yarn.lock ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 5001
CMD [ "yarn", "dev" ]
