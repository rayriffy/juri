FROM node:18-slim as deps-prod

WORKDIR /app

RUN mkdir -p /opt && \
    cp -a --parents /lib/*/libz.* /opt

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN npx pnpm -r i --frozen-lockfile --prod && npx pnpm prisma:generate

# ? -------------------------

FROM node:18-slim as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npx pnpm -r i --frozen-lockfile

COPY src ./src
COPY prisma ./prisma
COPY static ./static
COPY postcss.config.cjs svelte.config.js tailwind.config.cjs tsconfig.json vite.config.ts ./

RUN npx pnpm prisma:generate && npx pnpm build

# ? -------------------------

FROM gcr.io/distroless/nodejs18-debian11:nonroot as runner

USER nonroot
EXPOSE 3000

ENV NODE_ENV production
ENV PORT 3000

COPY --from=deps-prod /opt /

COPY package.json pnpm-lock.yaml ./
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=builder /app/.svelte-kit ./.svelte-kit
COPY --from=builder /app/build ./build

CMD ["./build/index.js"]
