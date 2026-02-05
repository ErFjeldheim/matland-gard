# Matland Gård - E-commerce Platform

> **Note**: This is a private commercial project for Matland Gård. The code is shared for portfolio purposes only. It is not open source and should not be copied or reused.

A modern Next.js 16 e-commerce solution for selling aggregates (stone, gravel, sand) and other farm products, featuring full order management and automated payment processing.

## 🚀 Tech Stack

- **Framework**: [Next.js 16.1.1](https://nextjs.org/) (React 19)
- **BaaS**: [Supabase](https://supabase.com/) (Auth, Database, Storage)
- **ORM**: [Prisma 7.3.0](https://www.prisma.io/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **Maps**: [Leaflet](https://leafletjs.com/)
- **Email**: [Nodemailer](https://nodemailer.com/)
- **Containerization**: [Docker](https://www.docker.com/)

---

## ✨ Features

- **Product Management**: Full catalog with image galleries and slug-based routing.
- **Shopping Cart & Checkout**: Seamless Stripe integration for secure payments.
- **Order System**: Automated order confirmation, delivery handling, and status tracking.
- **Email Notifications**: Automatic customer and admin alerts for new orders.
- **Interactive Maps**: Production location display using Leaflet.
- **Admin Dashboard**: Internal management for products and orders.
- **Production Ready**: Optimized Docker setup and automated migrations.

---

## 📂 Project Structure

```
.
├── app/                    # Next.js app directory (Pages, API, Components)
├── prisma/                # Database schema and migration history
├── public/                # Static assets (images, logos)
├── scripts/               # Utility scripts for data sync and maintenance
├── lib/                   # Shared utility libraries (Prisma client, etc.)
├── Dockerfile             # Production container definition
├── docker-compose.yml     # Production orchestration
└── *.md                   # Documentation for specific systems (Order, Payment, etc.)
```

### Technical Documentation
Detailed guides for specific systems:
- [Order System](file:///home/erik/Documents/matland-gard/ORDRESYSTEM.md)
- [Payment Integration](file:///home/erik/Documents/matland-gard/BETALING.md)
- [Email Setup](file:///home/erik/Documents/matland-gard/EMAIL_SETUP.md)
- [Image Management](file:///home/erik/Documents/matland-gard/BILDER.md)

---

## 🛠️ Getting Started

### 1. Environment Setup
Copy the example environment file and fill in required keys:
```bash
cp .env.example .env
```

### 2. Installation
```bash
npm install
```

### 3. Database-oppsett
Sørg for at du har lagt inn `DATABASE_URL` i `.env`. Kjør deretter:
```bash
npx prisma generate
```
*(Valgfritt: Bruk `npx prisma migrate dev` dersom du har gjort endringer i `schema.prisma`)*

### 4. Development
```bash
npm run dev
```

---

## 🚢 Deployment

The project is designed to run on a Debian server using Docker Compose.
- **Production Server**: `ssh debian-server`
- **Build & Run**: `docker compose up -d --build`

---

## 📜 License

© 2026 Matland Gård. All rights reserved. This project is proprietary and confidential.