# E-post konfigurasjon for Matland Gård

E-postfunksjonaliteten er nå implementert for å sende bestillingsvarsler.

## Hva som sendes

Når en kunde legger inn en bestilling:
1. **Kundebekreftelse**: Kunden mottar en ordrebekreftelse på sin e-post med:
   - Ordrenummer
   - Bestilte produkter og antall
   - Totalt beløp
   - Leveringsmetode og adresse
   
2. **Admin-varsel**: matlandgard@gmail.com mottar et varsel om den nye ordren med:
   - Kundens kontaktinformasjon
   - Bestilte produkter og antall
   - Totalt beløp
   - Leveringsdetaljer
   - Påminnelse om å behandle ordren i admin-panelet

## Oppsett av Gmail App Password

For at e-postfunksjonaliteten skal fungere, må du sette opp en app-spesifikt passord for Gmail:

1. **Aktiver 2-trinns verifisering på Gmail-kontoen** (matlandgard@gmail.com):
   - Gå til https://myaccount.google.com/security
   - Klikk på "2-Step Verification" og følg instruksjonene

2. **Opprett app-spesifikt passord**:
   - Gå til https://myaccount.google.com/apppasswords
   - Velg "Mail" som app og "Other" som device
   - Skriv inn "Matland Gård Nettside"
   - Klikk "Generate"
   - Kopier det 16-sifrede passordet (uten mellomrom)

3. **Legg til miljøvariabler**:
   Legg til følgende i din `.env` fil:
   ```
   EMAIL_USER=matlandgard@gmail.com
   EMAIL_PASSWORD=ditt_app_passord_her
   ```

## Testing

For å teste e-postfunksjonaliteten:
1. Sørg for at miljøvariablene er riktig satt opp
2. Start utviklingsserveren: `npm run dev`
3. Legg inn en testbestilling
4. Sjekk både kundens e-post og matlandgard@gmail.com for bekreftelse

## Feilsøking

Hvis e-poster ikke sendes:
- Sjekk at EMAIL_USER og EMAIL_PASSWORD er riktig satt i .env
- Bekreft at 2-trinns verifisering er aktivert
- Kontroller at app-passordet er gyldig
- Sjekk server-logger for feilmeldinger
- Verifiser at Gmail-kontoen ikke har blokkert "mindre sikre apper"

## Produksjonsmiljø

For produksjonsmiljøet, sørg for at miljøvariablene er satt i:
- Docker: legg til i `docker-compose.yml` under environment
- Server: sett i `.env` fil på serveren
