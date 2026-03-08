// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: 'DATABASE_URL="postgresql://7a7849055122e98f03aa3c90d61894e453ea9b2f1120bd8fa17d97e6c9cfaf21:sk_YPDvvxYOaiUJCZpo6CZW4@db.prisma.io:5432/postgres?sslmode=require" npx tsx ./prisma/seed.ts',
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});