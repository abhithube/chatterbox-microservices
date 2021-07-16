# Setup
FROM node-alpine AS base
WORKDIR /app

# Install production dependencies
FROM base AS deps
COPY ["package.json", "package-lock.json", "./"]
COPY prisma .
RUN npm ci
RUN npm prune --production

# Build source code
FROM base AS build
COPY ["package.json", "package-lock.json", "./"]
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Merge previous stages
FROM base
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["./entrypoint.sh"]