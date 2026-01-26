import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function CampingPage() {
  const t = useTranslations('Camping');
  const commonT = useTranslations('Common');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Image */}
        <div className="relative h-96 rounded-lg overflow-hidden mb-8 shadow-2xl">
          <Image
            src="/images/hero/gard-oversikt.jpg"
            alt={`${t('title')} - ${t('subtitle')}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 via-[var(--color-primary)]/30 to-transparent flex items-end">
            <div className="p-12 text-white">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">{t('title')}</h2>
              <p className="text-2xl">{t('subtitle')}</p>
              <p className="text-xl mt-2 text-[var(--color-accent)] font-semibold">{commonT('season')}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/images/camping/kai.jpg"
                  alt="Kai"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/images/camping/campingbil.jpg"
                  alt="Bobil"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md col-span-2">
                <Image
                  src="/images/hero/kayak.jpg"
                  alt="Kajakk"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-6">{t('welcome')}</h3>
            <p className="text-gray-800 mb-4">
              {t('desc1')}
            </p>
            <p className="text-gray-800 mb-4">
              {t('desc2')}
            </p>
            <p className="text-gray-800 mb-4">
              {t('desc3')}
            </p>

            <div className="bg-[var(--color-accent)]/20 border-l-4 border-[var(--color-primary)] p-6 mb-6">
              <h4 className="font-bold text-[var(--color-dark)] mb-2">🏖️ {t('facilities.title')}</h4>
              <ul className="text-gray-900 space-y-2">
                {t.raw('facilities.items').map((item: string) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 mb-6 border border-gray-200">
              <h4 className="font-bold text-[var(--color-dark)] mb-3">📋 {t('rules.title')}</h4>
              <ul className="text-gray-900 space-y-2 text-sm">
                <li>• <b>{t('rules.checkInOut')}:</b> {t('rules.checkInOutDesc')}</li>
                <li>• <b>{t('rules.quietTime')}:</b> {t('rules.quietTimeDesc')}</li>
                <li>• <b>{t('rules.waste')}:</b> {t('rules.wasteDesc')}</li>
                <li>• <b>{t('rules.fireSafety')}:</b> {t('rules.fireSafetyDesc')}</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">{t('booking.title')}</h4>
              <p className="text-gray-800 mb-6">
                {t('booking.desc')}
              </p>

              <a
                href="https://campio.no/nb/campsite/matland-fjord-camping?rid=66978e05e7f8ff92883c1aaf"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[var(--color-primary)] text-white text-center px-8 py-4 rounded-lg hover:bg-[var(--color-dark)] transition-colors font-bold text-lg mb-4">
                {t('booking.button')}
              </a>

              <div className="border-t pt-6">
                <h5 className="font-semibold text-gray-900 mb-3">{t('booking.contactDirect')}</h5>
                <div className="space-y-2 text-gray-800">
                  <p>📞 <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline">+47 954 58 563</a></p>
                  <p>✉️ <a href="mailto:matlandgard@gmail.com" className="text-[var(--color-primary)] hover:underline">matlandgard@gmail.com</a></p>
                  <p>📍 Ådlandsvegen 30, 5642 Holmefjord</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-[var(--color-accent)]/20 border border-[var(--color-primary)] rounded-lg p-6">
              <h5 className="font-bold text-[var(--color-dark)] mb-2">🌲 {t('activities.title')}</h5>
              <ul className="text-gray-900 space-y-1">
                {t.raw('activities.items').map((item: string) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Prices */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('prices.title')}</h3>

          <div className="mb-8">
            <h4 className="font-bold text-xl text-gray-900 mb-4">{t('prices.rental')}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">{t('prices.kayaks')}</h5>
                <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">200 kr</p>
                <p className="text-gray-800 text-sm">{t('prices.kayaksDesc')}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">{t('prices.sup')}</h5>
                <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">200 kr</p>
                <p className="text-gray-800 text-sm">{t('prices.supDesc')}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">{t('prices.tobias')}</h5>
                <p className="text-gray-800 text-sm mb-2">{t('prices.tobiasDesc')}</p>
                <div className="flex justify-between items-baseline border-t pt-2 mt-2">
                  <div className="text-sm text-gray-600">6t: <span className="text-lg font-bold text-[var(--color-primary)]">900 kr</span></div>
                  <div className="text-sm text-gray-600">12t: <span className="text-lg font-bold text-[var(--color-primary)]">1 350 kr</span></div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">{t('prices.buster')}</h5>
                <p className="text-gray-800 text-sm mb-2">{t('prices.busterDesc')}</p>
                <div className="flex justify-between items-baseline border-t pt-2 mt-2">
                  <div className="text-sm text-gray-600">6t: <span className="text-lg font-bold text-[var(--color-primary)]">1 350 kr</span></div>
                  <div className="text-sm text-gray-600">12t: <span className="text-lg font-bold text-[var(--color-primary)]">2 000 kr</span></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xl text-gray-900 mb-4">{t('prices.accommodation')}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">{t('prices.spot')}</h5>
                <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">450 kr</p>
                <p className="text-gray-800 text-sm">{t('prices.perNight')}</p>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-4">
            {t('prices.campioNote')}
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
