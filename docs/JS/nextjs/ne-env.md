## 環境構築

### composeファイル作成
ここでは`Next.js`と`PostgreSQL`を`docker-compose`にてビルドしてみる。  
docker-composeファイル等の例は[こちら](https://github.com/vercel/next.js/tree/canary/examples/with-docker-compose#how-to-use)を参照
```sh
pnpm create next-app --example with-docker-compose with-docker-compose-app
```

docker-compose.yamlにPostgresの環境を加える。
```yaml
version: "3"

services:
  next-app:
    container_name: next-app
    # ~~~~
    networks:
      - my_network
    depends_on:
      - db

  # Add more containers below (nginx, postgres, etc.)
  db:
    image: postgres:15
    volumes:
      - ./app/db/postgresql/data:/var/lib/postgresql/data
      - ./app/db/postgres:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --locale=C

volumes:
  postgres_data:
# Define a network, which allows containers to communicate
# with each other, by using their container name as a hostname
networks:
  my_network:
    external: true
```

デプロイ
```sh
# Create a network, which allows containers to communicate
# with each other, by using their container name as a hostname
docker network create my_network

# Build dev
docker compose -f docker-compose.dev.yml build

# Up dev
docker compose -f docker-compose.dev.yml up
```

### 接続設定

Prismaをインストール([詳細はこちら](/my-skill/JS/prisma/pr-01/))
```
pnpm install prisma --save-dev
```

**scheme.prisma**
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url       = env("DATABASE_URL")
}
```

**.env**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/db?schema=public"
```

### DBマイグレーション

```sh
pnpm prisma migrate dev --name first_migration
```

これにて`localhost:5432`にてテーブルができていることが確認できる。