# Setup
FROM node:alpine AS base
WORKDIR /app

# Install production dependencies
FROM base AS deps
COPY ["package.json", "package-lock.json", "./"]
RUN npm ci --omit=dev --ignore-scripts

# Build source code
FROM base AS build
COPY ["package.json", "package-lock.json", "./"]
RUN npm ci
COPY . .
RUN npm run build parties-service

# Merge previous stages
FROM base
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/parties-service ./dist

CMD ["node", "dist/main"]