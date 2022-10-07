FROM node:16

WORKDIR /app

RUN npm i -g hathora@0.9.25

ENV NODE_ENV=production

ARG APP_SECRET
ENV APP_SECRET=${APP_SECRET}

COPY . .
RUN hathora build --only server

CMD ["node", "server/dist/index.mjs"]
