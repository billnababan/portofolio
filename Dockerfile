# CMS server + dashboard in one image. The portfolio itself stays on Vercel.
FROM node:22-alpine AS cms
WORKDIR /app/cms
COPY cms/package*.json ./
RUN npm ci
COPY cms/ ./
RUN npm run build

FROM node:22-alpine AS server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production PORT=4000 STORAGE_DIR=/data CMS_DIST=/app/cms-dist
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=server /app/server/dist ./dist
COPY --from=cms /app/cms/dist /app/cms-dist
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 4000
# Migrations are idempotent, so running them on every start is safe.
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/index.js"]
