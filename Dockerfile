FROM node:20.11.0 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20.11.0-slim

RUN apt update && apt install libssl-dev dumb-init -y --no-install-recommends

WORKDIR /app

COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/.env .env
COPY --chown=node:node --from=build /app/package*.json ./

RUN npm install --omit=dev

ENV NODE_ENV production

EXPOSE 20000

CMD ["dumb-init", "node", "/app/dist/main"]
