export default function Footer() {
  return (
    <footer className="bg-[var(--color-dark)] text-white py-8 mt-16">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4 flex justify-center gap-4">
          <a href="/vilkar" className="hover:text-[var(--color-accent)] transition-colors">Salgsvilkår</a>
          <span className="text-gray-500">|</span>
          <a href="/personvern" className="hover:text-[var(--color-accent)] transition-colors">Personvern</a>
        </div>
        <p>&copy; {new Date().getFullYear()} MATLAND GÅRD | <a href="https://fjelldata.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">Nettsida er utvikla, drifta og vedlikehalden av Fjelldata</a></p>
      </div>
    </footer>
  );
}
