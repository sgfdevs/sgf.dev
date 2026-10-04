# ORIGIN is public and fixed in the SvelteKit 3 build. Never pass CMS secrets as build args.
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY vite.config.ts tsconfig.json ./
COPY src ./src
COPY static ./static
ARG ORIGIN
RUN test -n "$ORIGIN" && npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 BODY_SIZE_LIMIT=9M
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build --chown=node:node /app/build ./build
USER node
EXPOSE 3000
CMD ["npm", "run", "serve"]
