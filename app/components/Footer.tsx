export default function Footer() {
  return (
    <footer className="bg-[var(--color-dark)] text-white py-8 mt-16">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} MATLAND GARD AS | <a href="https://fjelldata.com">Nettsiden er utviklet, driftet og vedlikeholdt av Fjelldata</a></p>
      </div>
    </footer>
  );
}
