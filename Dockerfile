FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_ASSET_URL
ARG VITE_JWT_STORAGE_KEY=token
ARG VITE_GA4_MEASUREMENT_ID
ARG VITE_GA4_ENABLED=true


ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_ASSET_URL=${VITE_ASSET_URL}
ENV VITE_JWT_STORAGE_KEY=${VITE_JWT_STORAGE_KEY}
ENV VITE_GA4_MEASUREMENT_ID=${VITE_GA4_MEASUREMENT_ID}
ENV VITE_GA4_ENABLED=${VITE_GA4_ENABLED}

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
