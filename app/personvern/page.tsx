
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';

export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-[var(--color-dark)] text-white">
                <Navigation />
            </header>

            <main className="container mx-auto px-4 py-12 flex-grow">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 border-b pb-4">Personvernerklæring for Matland Gård</h1>

                    <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Behandlingsansvarleg</h2>
                            <p>
                                <strong>Matland Gård ENK</strong> (Org.nr 991 525 955) er behandlingsansvarleg for handsaminga av personopplysningar på denne nettstaden.
                            </p>
                            <p>
                                Kontaktinformasjon:<br />
                                Matland Gård<br />
                                Ådlandsvegen 30<br />
                                5642 Holmefjord<br />
                                E-post: matlandgard@gmail.com
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Hva slags informasjon vi samlar inn</h2>
                            <p>
                                Vi samlar inn og lagrar nødvendig informasjon for å kunne gjennomføre bestillingar og levere varer og tenester til deg. Dette inkluderer:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Namn</li>
                                <li>E-postadresse</li>
                                <li>Telefonnummer</li>
                                <li>Adresse (for levering)</li>
                                <li>Ordrehistorikk</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Formålet med handsaminga</h2>
                            <p>
                                Vi handsamar opplysningane for å:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Handsame og levere bestillinga di.</li>
                                <li>Oppfylle lovpålagte plikter (t.d. bokføringslova).</li>
                                <li>Kommunisere med deg om bestillinga di.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Databehandlarar og tredjepartar</h2>
                            <p>
                                Vi nyttar oss av følgjande tredjepartar for å drifte nettstaden og handsame betalingar:
                            </p>

                            <h3 className="text-xl font-medium text-gray-900 mt-4 mb-2">Teknisk drift og database</h3>
                            <p>
                                <strong>Fjeldheim Services ENK (Fjelldata)</strong> er vår leverandør av teknisk drift, utvikling og database. Fjelldata har tilgang til personopplysningar utelukkande for å kunne drifte og vedlikehalde systemet på vegne av oss.
                            </p>

                            <h3 className="text-xl font-medium text-gray-900 mt-4 mb-2">Betaling</h3>
                            <p>
                                Vi handsamar ikkje kortopplysningane dine sjølve. All betaling skjer via sikre eksterne betalingsleverandørar:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>Stripe:</strong> Handsamar kortbetalingar.</li>
                                <li><strong>Vipps:</strong> Handsamar mobilbetalingar.</li>
                            </ul>
                            <p className="mt-2">
                                Disse leverandørane handsamar betalingsopplysningar i tråd med sine eigne personvernerklæringar og gjeldande regelverk (PCI DSS).
                            </p>

                            <h3 className="text-xl font-medium text-gray-900 mt-4 mb-2">E-post</h3>
                            <p>
                                Vi nyttar <strong>Google (Gmail)</strong> for e-postkommunikasjon. Ordrebekreftelser og annan kommunikasjon vert sendt gjennom desse systema.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Dine rettar</h2>
                            <p>
                                Du har rett til innsyn i kva opplysningar vi har lagra om deg, og du kan krevje retting eller sletting av opplysningane om dei er feil eller ikkje lenger naudsynte. Merk at vi er pliktige til å ta vare på visse opplysningar i samband med rekneskap og bokføring (i 5 år etter rekneskapsåret er avslutta).
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
