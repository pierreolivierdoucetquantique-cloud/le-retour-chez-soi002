FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# VITE_API_URL est intégrée au bundle au moment du build (les variables Vite
# ne sont pas lues à l'exécution). Passez-la avec --build-arg si l'API ne vit
# pas à l'URL par défaut.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
