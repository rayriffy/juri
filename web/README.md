# web

Full-stack application to demonstrate Webauthn authentication method

## Install

```
pnpm -r i --frozen-lockfile
```

## Develop

First, you have to deploy database. Here's to develop and deploy locally with [Docker compose](https://docs.docker.com/compose/)

```
cp .env.example .env
docker-compose up -d
pnpm prisma migrate deploy
pnpm prisma generate
```

Then, start SvelteKit application with

```
pnpm dev
```
