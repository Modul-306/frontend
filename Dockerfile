FROM node:23-alpine as build
WORKDIR /app/src
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:23-alpine
WORKDIR /usr/app
COPY --from=build /app/src/dist/frontend ./
CMD node server/server.mjs
EXPOSE 4000