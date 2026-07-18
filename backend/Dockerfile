FROM node:22-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle

EXPOSE 4000

# Applique les migrations avant de démarrer le serveur, à chaque redémarrage
# du conteneur — sans danger si la base est déjà à jour.
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/index.js"]
