FROM node:20-alpine

RUN mkdir -p /usr/src/apiend && chown -R node:node /usr/src/apiend

WORKDIR /usr/src/apiend

COPY package.json yarn.lock ./

USER node

RUN corepack enable && yarn install --pure-lockfile

COPY --chown=node:node . .

# randomMadde.txt dosyasına yazma izni ver
RUN chmod 666 src/randomMadde.txt

RUN export NODE_OPTIONS=--max-old-space-size=8192

EXPOSE 5001
CMD [ "yarn", "dev" ]
