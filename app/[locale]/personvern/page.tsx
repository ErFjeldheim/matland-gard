import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
    const t = useTranslations('Privacy');

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
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.controller.title')}</h2>
                            <p>
                                <strong>Matland Gård ENK</strong> (Org.nr 991 525 955) {t('sections.controller.text')}
                            </p>
                            <p>
                                {t('sections.controller.contact')}<br />
                                Matland Gård<br />
                                Ådlandsvegen 30<br />
                                5642 Holmefjord<br />
                                E-post: matlandgard@gmail.com
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.info.title')}</h2>
                            <p>{t('sections.info.text')}</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                {(t.raw('sections.info.items') as string[]).map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.purpose.title')}</h2>
                            <p>{t('sections.purpose.text')}</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                {(t.raw('sections.purpose.items') as string[]).map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.processors.title')}</h2>
                            <p>{t('sections.processors.text')}</p>

                            <h3 className="text-xl font-medium text-gray-900 mt-4 mb-2">{t('sections.processors.it.title')}</h3>
                            <p>{t('sections.processors.it.text')}</p>

                            <h3 className="text-xl font-medium text-gray-900 mt-4 mb-2">{t('sections.processors.payment.title')}</h3>
                            <p>{t('sections.processors.payment.text1')}</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>Stripe:</strong> {t('sections.processors.payment.stripe')}</li>
                                <li><strong>Vipps:</strong> {t('sections.processors.payment.vipps')}</li>
                            </ul>
                            <p className="mt-2 text-sm italic">{t('sections.processors.payment.text2')}</p>

                            <h3 className="text-xl font-medium text-gray-900 mt-4 mb-2">{t('sections.processors.email.title')}</h3>
                            <p>{t('sections.processors.email.text')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('sections.rights.title')}</h2>
                            <p>{t('sections.rights.text')}</p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
