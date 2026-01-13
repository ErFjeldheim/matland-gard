
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';

export const dynamic = 'force-dynamic';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-[var(--color-dark)] text-white">
                <Navigation />
            </header>

            <main className="container mx-auto px-4 py-12 flex-grow">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 border-b pb-4">Salsvilkår for Matland Gård</h1>

                    <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Innleiing</h2>
                            <p>
                                Dette kjøpet er regulert av dei nedanforståande standard salsvilkåra for forbrukarkjøp av varer over internett. Forbrukarkjøp over internett vert regulert hovudsakeleg av avtalelova, forbrukarkjøpslova, marknadsføringslova, angrerettlova og ehandelslova, og desse lovene gjev forbrukaren ufråvikelege rettar. Vilkåra i denne avtalen skal ikkje forståast som noko avgrensing i dei lovbestemde rettane, men oppstiller partane sine viktigaste rettar og plikter for handelen.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Avtalen</h2>
                            <p>
                                Avtalen består av desse salsvilkåra, opplysningar gjeve i bestillingsløysinga og eventuelt særskilt avtalte vilkår. Ved eventuell motstrid mellom opplysningane, går det som særskilt er avtalt mellom partane framfor, så framt det ikkje stridar mot ufråvikeleg lovgjeving.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Partane</h2>
                            <p>
                                <strong>Seljar er:</strong><br />
                                MATLAND GÅRD ENK<br />
                                Ådlandsvegen 30<br />
                                5642 Holmefjord<br />
                                E-post: matlandgard@gmail.com<br />
                                Telefon: +47 954 58 563<br />
                                Organisasjonsnummer: 991 525 955<br />
                                Heretter omtalt som «seljar» eller «oss».
                            </p>
                            <p>
                                <strong>Kjøpar er:</strong><br />
                                Den forbrukaren som gjer bestillinga, heretter omtalt som «kjøpar» eller «du».
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Pris</h2>
                            <p>
                                Den oppgjevne prisen for vara og tenester er den totale prisen kjøpar skal betale. Denne prisen inkluderer alle avgifter og meirverdiavgift. Ytterlegare kostnader som seljar før kjøpet ikkje har informert om, skal kjøpar ikkje bere.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Avtaleinngåing</h2>
                            <p>
                                Avtalen er bindande for begge partar når kjøpar har sendt si bestilling til seljar.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Betalinga</h2>
                            <p>
                                Seljar kan krevje betaling for vara frå det tidspunktet ho blir sendt frå seljar til kjøpar. Dersom kjøpar brukar kredittkort eller debetkort ved betaling, kan seljar reservere kjøpesummen på kortet ved bestilling. Kortet blir belasta same dag som vara blir sendt.
                            </p>
                            <p>
                                Vi tilbyr betaling med <strong>Vipps</strong> og <strong>kortbetaling (Stripe)</strong>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Levering</h2>
                            <p>
                                Levering er skjedd når kjøpar, eller hans representant, har overtatt tingen.
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>Henting:</strong> Kan gjerast etter avtale på Matland Gård.</li>
                                <li><strong>Levering:</strong> Vi tilbyr levering i spesifiserte soner (Bergen/Omegn) mot eit frakttillegg. Leveringstidspunkt avtalast nærare.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Angrerett</h2>
                            <p>
                                Kjøpar kan angre kjøpet av vara etter angrerettlova. Kjøpar må gje seljar melding om bruk av angreretten innan 14 dagar etter at fristen byrja å løpe. I fristen inkluderer ein alle kalenderdagar. Dersom fristen endar på ein laurdag, heilagdag eller høgtidsdag, forlengar ein fristen til næraste virkedag.
                            </p>
                            <p>
                                Ved bruk av angreretten må vara leverast tilbake til seljar utan unødig opphald og seinast 14 dagar etter at melding om bruk av angreretten er gjeve. Kjøpar dekkjer dei direkte kostnadene ved å returnere vara.
                            </p>
                            <p className="italic text-gray-600 mt-2">
                                Unntak: For levering av lausmasse (singel, grus, jord) som er tippa av og blanda med andre massar, eller som av natur ikkje kan returnerast, fell angreretten bort ved levering.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Reklamasjon ved mangel og frist for å melde krav ved forseinking</h2>
                            <p>
                                Dersom det føreligg ein mangel ved vara må kjøpar innan rimeleg tid etter at den vart oppdaga eller burde vore oppdaga, gje seljar melding om at han eller ho vil påberope seg mangelen. Kjøpar har alltid reklamert tidsnok dersom det skjer innan 2 mnd. frå mangelen vart oppdaga eller burde blitt oppdaga. Reklamasjon kan skje seinast to år etter at kjøpar overtok vara.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Konfliktløysing</h2>
                            <p>
                                Klager vert retta til seljar innan rimeleg tid. Partane skal forsøke å løyse eventuelle tvistar i minnelegheit. Dersom dette ikkje lukkast, kan kjøpar ta kontakt med Forbrukertilsynet for mekling.
                            </p>
                        </section>

                        <div className="border-t border-gray-200 my-8"></div>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tilleggsvilkår for Booking og Utleige</h2>

                            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-2">Bobilparkering / Camping</h3>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Bestilling er bindande.</li>
                                <li>Avbestilling må skje seinast 24 timar før ankomst for full refusjon.</li>
                                <li>Ved avbestilling seinare enn 24 timar før ankomst, vert ikkje beløpet refundert.</li>
                                <li>Innsjekk er etter kl. 12:00 med mindre anna er avtalt.</li>
                            </ul>

                            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-2">Selskapslokale / Sjøbua</h3>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>For leige av selskapslokale gjeld eigen leigekontrakt som vert signert ved bestilling.</li>
                                <li>Avbestilling av selskapslokale må skje seinast 30 dagar før arrangementet.</li>
                                <li>Ved avbestilling 14-30 dagar før arrangementet fakturerast 50% av leigesummen.</li>
                                <li>Ved avbestilling mindre enn 14 dagar før fakturerast heile leigesummen.</li>
                                <li>Leigetakar er ansvarleg for eventuelle skadar på lokale og inventar i leigeperioden.</li>
                            </ul>
                        </section>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
