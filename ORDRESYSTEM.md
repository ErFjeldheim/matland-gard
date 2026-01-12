# Ordresystem - Implementering fullført ✅

## Oversikt
Et komplett ordresystem for Matland Singel & Stein med støtte for både Vipps og kortbetaling via Stripe.

## Arkitektur

### Frontend (Client Components)
- **ProductCards** (`app/components/ProductCards.tsx`)
  - Viser produktkort med bilder, priser, beskrivelser
  - Håndterer klikk på "Betal med Vipps" og "Betal med kort"
  - Åpner CheckoutModal med valgt produkt og betalingsmetode

- **CheckoutModal** (`app/components/CheckoutModal.tsx`)
  - Kundeinformasjon-skjema (navn, e-post, telefon, adresse)
  - Mengdevalg (antall sekker/tonn)
  - Prisutregning i sanntid
  - Sender bestilling til riktig API-endpoint
  - Håndterer redirect til Stripe eller ordrebekreftelse

### Backend (API Routes)

#### `/api/checkout/stripe` (POST)
Håndterer kortbetaling:
1. Validerer produktdata
2. Oppretter ordre i database med status "pending"
3. Oppretter Stripe Checkout session
4. Returnerer URL til Stripe-betaling

**Request:**
```json
{
  "productId": "uuid",
  "quantity": 10,
  "customerName": "Ola Nordmann",
  "customerEmail": "ola@example.com",
  "customerPhone": "+4712345678",
  "deliveryAddress": "Gateveien 1, 0000 Oslo"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/...",
  "orderId": "uuid"
}
```

#### `/api/checkout/vipps` (POST)
Håndterer Vipps-betaling (manuell prosess):
1. Validerer produktdata
2. Oppretter ordre i database med status "pending"
3. Returnerer Vipps-nummer og ordre-ID

**Response:**
```json
{
  "orderId": "uuid",
  "vippsNumber": "+4795458563"
}
```

### Ordrebekreftelse

#### `/bestilling/[id]` (Server Component)
Viser ordredetaljer:
- Ordre-ID og status (pending/paid/processing/delivered/cancelled)
- Kundeinformasjon
- Produktliste med mengder og priser
- Total pris
- Betalingsinstruksjoner (for Vipps)
- Kontaktinformasjon

**Status-badges:**
- 🟡 Pending (gul) - Venter på betaling
- 🟢 Paid (grønn) - Betalt
- 🔵 Processing (blå) - Under behandling
- 🟣 Delivered (lilla) - Levert
- 🔴 Cancelled (rød) - Kansellert

## Database Schema

### Order
```prisma
model Order {
  id              String      @id @default(uuid())
  customerName    String
  customerEmail   String
  customerPhone   String
  deliveryAddress String?
  totalAmount     Int         // Pris i øre
  status          String      @default("pending")
  paymentMethod   String?     // "vipps" eller "stripe"
  paymentId       String?     // Stripe session ID
  orderItems      OrderItem[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

### OrderItem
```prisma
model OrderItem {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId])
  productId String
  product   Product  @relation(fields: [productId])
  quantity  Int
  price     Int      // Pris i øre per enhet
  createdAt DateTime @default(now())
}
```

## Brukerflyt - Vipps

```
1. Kunde: Velger produkt → "Betal med Vipps"
2. Modal: Fyller inn info + antall
3. API: Oppretter ordre (status: pending)
4. Kunde: Sendes til /bestilling/[id]
5. Side: Viser Vipps-nummer +47 954 58 563
6. Kunde: Vippser beløp med ordre-ID i melding
7. Admin: Sjekker Vipps → markerer ordre som "paid"
```

## Brukerflyt - Stripe

```
1. Kunde: Velger produkt → "Betal med kort"
2. Modal: Fyller inn info + antall
3. API: Oppretter ordre (status: pending)
4. API: Oppretter Stripe Checkout session
5. Kunde: Omdirigeres til Stripe
6. Kunde: Betaler med kort
7. Stripe: Redirect til /bestilling/[id]?success=true
8. Webhook: Oppdaterer ordre til "paid" og sender e-postbekreftelser (via `/api/webhooks/stripe`)
```

## Stripe Webhook

Når en betaling er fullført på Stripe, sender Stripe et varsel (webhook) til nettsiden. Dette trigger:
1. Oppdatering av ordrestatus fra `pending` til `paid`.
2. Utsending av ordrebekreftelse til kundens e-post.
3. Utsending av varsel til admin (Matland Gård).

**Webhook URL:** `https://new.matlandgard.no/api/webhooks/stripe`
**Event type:** `checkout.session.completed`

## Miljøvariabler

### Nødvendige for produksjon:
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Success/Cancel URLs
NEXT_PUBLIC_URL="https://matlandgard.no"

# Stripe Webhook Secret (for verifisering av webhook-kall)
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Test-miljø:
```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_URL="http://localhost:3000"
```

## Testing

### Lokalt:
```bash
# Start dev server
docker-compose -f docker-compose.dev.yml up -d

# Run development
npm run dev

# Test på http://localhost:3000/singel
```

### Test Stripe:
- Kortnummer: `4242 4242 4242 4242`
- Utløpsdato: Hvilken som helst fremtidig dato
- CVC: `123`
- Postnummer: `12345`

## Deployment

### Forutsetninger:
1. Database-migrering kjørt:
   ```bash
   docker exec -it matland-gard-db-1 psql -U matland_user -d matland_store
   # Kjør SQL fra prisma/migrations/20260106000844_add_orders/migration.sql
   ```

2. Miljøvariabler satt på server:
   ```bash
   # Legg til i .env på serveren:
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   NEXT_PUBLIC_URL=https://new.matlandgard.no
   ```

3. Push til GitHub:
   ```bash
   git add .
   git commit -m "feat: add order system with Stripe and Vipps"
   git push origin main
   ```

4. GitHub Actions vil automatisk:
   - Bygge Docker image
   - SSH til server
   - Kjøre docker-compose up -d
   - Restarte applikasjonen

## Fremtidige forbedringer

### Prioritert:
1. **Stripe Webhook** - Automatisk oppdatering av ordre-status
   ```typescript
   // app/api/webhooks/stripe/route.ts
   // Lytt på checkout.session.completed
   ```

2. **E-postvarslinger** - Send bekreftelse til kunde og admin
   ```typescript
   // lib/email.ts
   // Bruk nodemailer eller SendGrid
   ```

3. **Vipps ePayment API** - Automatisk betalingsintegrasjon
   ```typescript
   // app/api/checkout/vipps/route.ts
   // Integrer med Vipps ePayment API
   ```

### Senere:
- Admin-panel for ordrehåndtering
- Ordrehistorikk for kunder
- Leveringskostnad-kalkulator
- Lagerstatussystem
- Fakturaautomatisering

## Sikkerhet

### Implementert:
- ✅ Miljøvariabler for sensitive nøkler
- ✅ Server-side validering av alle inputs
- ✅ Stripe Checkout (PCI-compliant)
- ✅ HTTPS påkrevd i produksjon

### Anbefalt:
- [ ] Rate limiting på API-endpoints
- [ ] CAPTCHA på checkout-skjema
- [ ] Webhook signature verification
- [ ] Admin-autentisering for ordrehåndtering

## Support

Ved problemer:
1. Sjekk logs: `docker logs matland-gard-app-1`
2. Sjekk database: `docker exec -it matland-gard-db-1 psql -U matland_user -d matland_store`
3. Test Stripe i dashboard: https://dashboard.stripe.com/test/payments
4. Verifiser miljøvariabler: `.env` filen på serveren

## Kildekode

Alle filer relatert til ordresystemet:

```
app/
├── api/
│   └── checkout/
│       ├── stripe/route.ts    # Stripe checkout API
│       └── vipps/route.ts     # Vipps checkout API
├── bestilling/
│   └── [id]/
│       └── page.tsx           # Ordrebekreftelse
├── components/
│   ├── CheckoutModal.tsx      # Checkout-skjema
│   └── ProductCards.tsx       # Produktvisning med betaling
└── singel/
    └── page.tsx               # Produktside

prisma/
├── schema.prisma              # Database schema
└── migrations/
    └── 20260106000844_add_orders/
        └── migration.sql      # Order + OrderItem tabeller
```

---

**Status:** ✅ Klar for testing og produksjon
**Sist oppdatert:** 6. januar 2025
