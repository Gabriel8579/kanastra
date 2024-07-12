FROM node:18.20.2-alpine as builder

ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY package.json ./
COPY yarn.lock ./

RUN rm -rf node_modules && yarn install --frozen-lockfile

COPY --chown=node:node . .

RUN yarn build \
  && yarn install --production --ignore-scripts --prefer-offline

# ---

FROM node:18.20.2-alpine

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package.json ./
COPY --from=builder --chown=node:node /home/node/yarn.lock ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/
COPY --from=builder --chown=node:node /home/node/prisma/ ./prisma/
COPY --from=builder --chown=node:node /home/node/docker-entry.sh ./

RUN yarn prisma generate

EXPOSE 3000

ENTRYPOINT [ "./docker-entry.sh" ]
