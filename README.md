# Matland Gård - E-commerce Platform

Next.js 16 + Prisma 7 + PostgreSQL e-commerce solution for selling aggregates (stone, gravel, sand).

## Tech Stack

- **Framework**: Next.js 16.1.1 (React 19)
- **Database**: PostgreSQL 15
- **ORM**: Prisma 7.2.0
- **Runtime**: Node.js 20
- **Styling**: Tailwind CSS v4
- **Container**: Docker + Docker Compose

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/ErFjeldheim/matland-gard.git
cd matland-gard
```

### 2. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and update with your database credentials.

### 3. Start with Docker
```bash
docker compose up -d
```

### 4. Seed the database
```bash
docker compose exec app npx tsx prisma/seed.ts
```

### 5. Access the application
- Website: http://localhost:3000
- API: http://localhost:3000/api/products

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
├── docker-compose.yml     # Docker services configuration
├── Dockerfile             # Docker image definition
└── package.json           # Node.js dependencies
```

## Development

### Run locally without Docker
```bash
npm install
npx prisma generate
npm run dev
```

### Database commands
```bash
# Generate Prisma Client
npx prisma generate

# Seed database
npx tsx prisma/seed.ts

# View database in Prisma Studio
npx prisma studio
```

## Apache Configuration

The application runs behind Apache as a reverse proxy on port 3000.

Configuration file: `/etc/apache2/sites-available/new.matlandgard.no.conf`

## License

Private project for Matland Gård.
