# Bildeintegrasjon for Matland Gård

## Mappestruktur

```
public/
└── images/
    ├── products/          # Produktbilder
    │   ├── herregaardssingel.jpg
    │   ├── kirkegaardssingel.jpg
    │   ├── elvestein.jpg
    │   ├── grus-016mm.jpg
    │   ├── grus-032mm.jpg
    │   └── sand.jpg
    ├── camping/           # Campingbilder
    │   ├── campingplass.jpg
    │   ├── hytte.jpg
    │   └── fjord.jpg
    ├── arrangement/       # Arrangementsbilder
    │   ├── bryllup.jpg
    │   ├── konferanse.jpg
    │   └── lokale.jpg
    └── hero/             # Hero-bilder for forsiden
        ├── gard.jpg
        └── fjord.jpg
```

## Legge til bilder

### 1. Kopier bilder til public/images-mappen
```bash
# Eksempel: Kopier bilder fra Downloads
cp ~/Downloads/herregaardssingel.jpg public/images/products/
cp ~/Downloads/kirkegaardssingel.jpg public/images/products/
# osv...
```

### 2. Oppdater databasen med bildestier
```bash
npm run update-images
```

Dette scriptet oppdaterer alle produkter i databasen med riktige bildestier.

### 3. For produksjon
Etter at bilder er lagt til lokalt:
```bash
git add public/images/
git commit -m "feat: legg til produktbilder"
git push origin main
```

GitHub Actions vil automatisk deploye endringene til serveren.

## Bildeformat

- **Format**: JPG eller WebP (anbefalt for web)
- **Størrelse**: Maks 2MB per bilde
- **Dimensjoner**: 
  - Produktbilder: 800x600px (4:3 ratio)
  - Hero-bilder: 1920x1080px (16:9 ratio)
  - Campingbilder: 1200x800px

## Bildekrav

Alle bilder bør være:
- ✅ Komprimert for web (bruk TinyPNG eller liknende)
- ✅ I riktig format (JPG for foto, PNG for grafikk)
- ✅ Beskåret til riktig sideforhold
- ✅ Godt opplyste og skarpe

## Bildeoptimalisering

Next.js Image-komponenten optimaliserer automatisk bilder ved:
- Automatisk resizing
- WebP-konvertering for støttede nettlesere
- Lazy loading (bilder lastes kun når de er synlige)
- Automatisk sizing basert på enhet

## Manuell oppdatering av produktbilder

Du kan også oppdatere bilder via databasen direkte:

```sql
UPDATE "Product" SET image = '/images/products/herregaardssingel.jpg' WHERE name = 'Herregårdssingel';
```

Eller via Prisma Studio:
```bash
npx prisma studio
```

## Fremtidige forbedringer

- [ ] Bildegallerier for produkter (flere bilder per produkt)
- [ ] Admin-panel for opplasting av bilder
- [ ] Automatisk komprimering av opplastede bilder
- [ ] Støtte for bilder i arrangement- og campingseksjoner
