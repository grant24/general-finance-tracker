# Multi-stage build for monorepo
FROM node:18-alpine AS base

# Install dependencies for the entire monorepo
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY packages/drizzle/package*.json ./packages/drizzle/
COPY packages/zod/package*.json ./packages/zod/
RUN npm ci

# Build packages and server
FROM base AS build-server
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:backend

# Build client
FROM base AS build-client  
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:client

# Production server image
FROM base AS server
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build-server /app/server/dist ./server/dist
COPY --from=build-server /app/packages ./packages
COPY package*.json ./
EXPOSE 2022
CMD ["npm", "run", "start:server"]

# Production client image (for separate deployment)
FROM nginx:alpine AS client
COPY --from=build-client /app/client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]