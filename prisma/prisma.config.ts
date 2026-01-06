import { defineConfig } from '@prisma/client/prisma.config';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});
