# Betalingssystem - Setup Guide

## Oversikt
Nettstedet støtter to betalingsmetoder:
- **Vipps**: Foreløpig manuell prosess (fremtidig: Vipps ePayment API)
- **Stripe**: Full automatisk kortbetaling

## Oppsett

### 1. Stripe Nøkler
Du trenger Stripe API-nøkler for å aktivere kortbetaling:

1. Registrer deg på [stripe.com](https://stripe.com)
2. Gå til Dashboard → Developers → API keys
3. Kopier:
   - **Publishable key** (starter med `pk_test_` for test-miljø)
   - **Secret key** (starter med `sk_test_` for test-miljø)

### 2. Miljøvariabler
Legg til i `.env` (basert på `.env.example`):

```env
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

⚠️ **Viktig**: 
- Test-nøkler (`sk_test_`, `pk_test_`) for utvikling
- Live-nøkler (`sk_live_`, `pk_live_`) kun i produksjon
- Ikke commit `.env` til Git (er allerede i `.gitignore`)

### 3. Database Migrering
Ordresystemet krever tabeller i databasen:

```bash
# Lokal database (dev)
docker-compose -f docker-compose.dev.yml up -d
# Migrasjon er allerede kjørt

# Produksjon
# Koble til serveren og kjør:
docker exec -it matland-gard-db-1 psql -U matland_user -d matland_store
# Kjør SQL fra prisma/migrations/20260106000844_add_orders/migration.sql
```

## Brukerflyt

### Kunde-opplevelse:
1. Kunde går til `/singel` og velger produkt
2. Klikker "Betal med Vipps" eller "Betal med kort"
3. Modal åpnes med:
   - Mengdevalg
   - Kundeinfo (navn, e-post, telefon, adresse)
   - Totalpris
4. Sender inn ordre

**Vipps**:
- Ordre opprettes med status "pending"
- Kunde sendes til `/bestilling/[id]` med instruksjoner
- Viser Vipps-nummer: +47 954 58 563
- Ber om å merke betaling med ordre-ID

**Stripe**:
- Ordre opprettes med status "pending"
- Stripe Checkout session opprettes
- Kunde omdirigeres til Stripe-betaling
- Etter betaling → sendes til `/bestilling/[id]`

## Testing

### Test Stripe lokalt:
1. Bruk test-kortnummer: `4242 4242 4242 4242`
2. Utløpsdato: Hvilken som helst fremtidig dato
3. CVC: Hvilken som helst 3 siffer
4. Postnummer: Hvilket som helst

### Test Vipps:
- For nå: manuell prosess
- Fremtidig: Integrasjon med Vipps ePayment API

## API Endpoints

### `POST /api/checkout/stripe`
Oppretter ordre og Stripe checkout session.

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
  "orderId": "uuid"
}
```

### `POST /api/checkout/vipps`
Oppretter ordre for Vipps-betaling.

**Request:** (samme som Stripe)

**Response:**
```json
{
  "orderId": "uuid",
  "vippsNumber": "+4795458563"
}
```

## Ordre-status
- `pending`: Venter på betaling
- `paid`: Betaling mottatt
- `processing`: Under behandling
- `shipped`: Sendt/levert
- `cancelled`: Kansellert

## Fremtidige forbedringer
- [ ] Vipps ePayment API integrasjon
- [ ] Stripe webhook for automatisk statusoppdatering
- [ ] Admin-grensesnitt for ordrehåndtering
- [ ] E-postvarslinger til kunde og admin
- [ ] Leveringskostnad-kalkulator
- [ ] Ordre-tracking for kunde
