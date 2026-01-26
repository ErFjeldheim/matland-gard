import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

export default function TermsPage() {
    const t = useTranslations('Terms');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-[var(--color-dark)] text-white">
                <Navigation />
            </header>

            <main className="container mx-auto px-4 py-12 flex-grow">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 border-b pb-4">{t('title')}</h1>

                    <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.intro.title')}</h2>
                            <p>{t('sections.intro.text')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.agreement.title')}</h2>
                            <p>{t('sections.agreement.text')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.parties.title')}</h2>
                            <p>
                                <strong>{t('sections.parties.sellerLabel')}</strong><br />
                                MATLAND GÅRD ENK<br />
                                Ådlandsvegen 30<br />
                                5642 Holmefjord<br />
                                E-post: matlandgard@gmail.com<br />
                                Telefon: +47 954 58 563<br />
                                Organisasjonsnummer: 991 525 955<br />
                                {t('sections.parties.sellerDescription')}
                            </p>
                            <p>
                                <strong>{t('sections.parties.buyerLabel')}</strong><br />
                                {t('sections.parties.buyerText')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.price.title')}</h2>
                            <p>{t('sections.price.text')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.formation.title')}</h2>
                            <p>{t('sections.formation.text')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.payment.title')}</h2>
                            <p>{t('sections.payment.text')}</p>
                            <p><strong>{t('sections.payment.methods')}</strong></p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.delivery.title')}</h2>
                            <p>{t('sections.delivery.text')}</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>{t('sections.delivery.pickup').split(':')[0]}:</strong>{t('sections.delivery.pickup').split(':')[1]}</li>
                                <li><strong>{t('sections.delivery.shipping').split(':')[0]}:</strong>{t('sections.delivery.shipping').split(':')[1]}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.withdrawal.title')}</h2>
                            <p>{t('sections.withdrawal.text1')}</p>
                            <p>{t('sections.withdrawal.text2')}</p>
                            <p className="italic text-gray-600 mt-2">{t('sections.withdrawal.exception')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.complaints.title')}</h2>
                            <p>{t('sections.complaints.text')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.conflicts.title')}</h2>
                            <p>{t('sections.conflicts.text')}</p>
                        </section>

                        <div className="border-t border-gray-200 my-8"></div>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.additional.title')}</h2>

                            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-2">{t('sections.additional.camping.title')}</h3>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                {(t.raw('sections.additional.camping.items') as string[]).map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>

                            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-2">{t('sections.additional.venue.title')}</h3>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                {(t.raw('sections.additional.venue.items') as string[]).map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
