FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ARG VITE_MERCHANT_ID=1
ARG VITE_AGENT_ID=2
ARG VITE_API_BASE_URL=

ENV VITE_MERCHANT_ID=$VITE_MERCHANT_ID
ENV VITE_AGENT_ID=$VITE_AGENT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
