# Stage 1 — Install dependencies
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
RUN bun install --frozen-lockfile

# Stage 2 — Build application
FROM oven/bun:1 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY apps/web/ ./apps/web/
COPY tsconfig.json ./
ARG VITE_BASE_URL
ARG VITE_ANAMNESIS_TEMPLATE_ID
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_ANAMNESIS_TEMPLATE_ID=$VITE_ANAMNESIS_TEMPLATE_ID
RUN cd apps/web && bun run build

# Stage 3 — Serve with Nginx
FROM nginx:alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
