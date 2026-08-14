import Link from 'next/link';

export default function FreeInspectionBanner() {
  return (
    <div className="bg-[var(--color-primary)] text-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-6 p-8 md:p-10">
        <div className="flex-shrink-0">
          <svg className="w-16 h-16 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">Gratis synfaring på ditt prosjekt</h3>
          <p className="text-white/90 text-lg">
            Usikker på kor mykje masse du treng? Vi kjem gjerne på gratis synfaring for å sjå på prosjektet ditt og gi råd – heilt uforpliktande.
          </p>
        </div>
        <div className="flex-shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
          <a
            href="tel:+4795458563"
            className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-dark)] font-semibold px-6 py-3 rounded-lg hover:bg-[var(--color-accent)] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            954 58 563
          </a>
          <Link
            href="/kontakt"
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-dark)] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[var(--color-accent)] transition-colors"
          >
            Kontakt oss
          </Link>
        </div>
      </div>
    </div>
  );
}
