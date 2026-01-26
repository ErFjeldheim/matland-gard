import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-[var(--color-dark)] text-white py-8 mt-16">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4 flex justify-center gap-4">
          <a href="/vilkar" className="hover:text-[var(--color-accent)] transition-colors">{t('terms')}</a>
          <span className="text-gray-500">|</span>
          <a href="/personvern" className="hover:text-[var(--color-accent)] transition-colors">{t('privacy')}</a>
        </div>
        <p>&copy; {new Date().getFullYear()} MATLAND GÅRD | <a href="https://fjelldata.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">{t('credits')}</a></p>
      </div>
    </footer>
  );
}
