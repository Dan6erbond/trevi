FROM node:24-alpine AS base

RUN npm install -g npm@11.6.2

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npm run build && npm cache clean --force

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nitro

COPY --from=builder /app ./

USER nitro

EXPOSE 3000

CMD ["npm", "run", "start"]
