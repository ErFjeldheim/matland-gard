import { defineConfig } from '@prisma/client/prisma.config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL
  }
});
