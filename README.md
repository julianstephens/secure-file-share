# Secure File Sharing

## Prerequisites

- Node 18+
- pnpm
- Docker/Docker Compose

## Setup Instructions

#### Install Packages

```sh
pnpm i
```

#### Create .env file

```
DB_USER=
DB_PASS=
DB_NAME=
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
NEXT_PUBLIC_API_KEY=
HASH_KEY=
```

#### Start database

```sh
docker volume create sfs-data
docker compose up -d
```

#### Apply schema and generate DB client

```sh
pnpm db:push
pnpm postinstall
```

#### Start Application

```sh
pnpm dev
```
