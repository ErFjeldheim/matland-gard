# Matland Gård - E-commerce Platform

> **Note**: This is a private commercial project for Matland Gård. The code is published on GitHub for portfolio and job application purposes only. It is not open source and should not be copied or reused.

Next.js 16 + Prisma 7 + PostgreSQL e-commerce solution for selling aggregates (stone, gravel, sand).

## Tech Stack

- **Framework**: Next.js 16.1.1 (React 19)
- **Database**: PostgreSQL 15
- **ORM**: Prisma 7.2.0
- **Runtime**: Node.js 20
- **Styling**: Tailwind CSS v4
- **Container**: Docker + Docker Compose

---

## Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── products/      # Product endpoints
│   └── page.tsx           # Homepage
├── lib/                   # Utility libraries
│   └── prisma.ts          # Prisma client configuration
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── public/                # Static assets
├── docker-compose.yml     # Production configuration
├── docker-compose.dev.yml # Development configuration
├── Dockerfile             # Docker image definition
└── package.json           # Node.js dependencies
```

## Features

- Server-side rendered product catalog
- RESTful API endpoints
- PostgreSQL database with Prisma ORM
- Docker containerization
- Automated deployment via GitHub Actions
- Production-ready setup with health checks

---

## License

© 2026 Matland Gård. All rights reserved.

This project is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited.
