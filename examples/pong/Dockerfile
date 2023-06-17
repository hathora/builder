FROM node:18

WORKDIR /app

COPY . .

RUN npm i -g hathora@0.11.5
RUN npx hathora build --only server

ENV NODE_ENV=production
ENV DATA_DIR=/app/data

CMD ["node", "server/dist/index.mjs"]
