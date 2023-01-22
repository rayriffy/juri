FROM node:18-slim as deps

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN yarn global add pnpm && pnpm -r i --frozen-lockfile

# ? -------------------------

FROM node:18-slim as deps-prod

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN yarn global add pnpm && pnpm -r i --frozen-lockfile --prod && pnpm prisma:generate

# ? -------------------------

FROM node:18-slim as builder

WORKDIR /app
COPY src ./src
COPY prisma ./prisma
COPY static ./static
COPY package.json pnpm-lock.yaml* postcss.config.cjs svelte.config.js tailwind.config.cjs tsconfig.json vite.config.ts ./
COPY --from=deps /app/node_modules ./node_modules

RUN yarn global add pnpm && pnpm prisma:generate && pnpm build

# ? -------------------------

FROM node:18-slim as runner

ENV NODE_ENV production

COPY package.json pnpm-lock.yaml ./
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=builder /app/.svelte-kit ./.svelte-kit
COPY --from=builder /app/build ./build

EXPOSE 3000
ENV PORT 3000

CMD ["./build/index.js"]