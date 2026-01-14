'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const { totalItems } = useCart();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Check admin authentication status
    fetch('/api/admin/check-auth')
      .then(res => res.json())
      .then(data => setIsAdmin(data.isAuthenticated))
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/nettbutikk', label: 'Singel & Stein' },
    { href: '/camping', label: 'Bobilparkering' },
    { href: '/arrangement', label: 'Selskapslokale' },
    { href: '/kontakt', label: 'Kontakt oss' },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin', label: 'Kontrollpanel' });
  }

  return (
    <nav className="bg-[var(--color-dark)] text-white shadow-lg relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <h1 className="text-2xl font-bold group-hover:text-[var(--color-accent)] transition-colors duration-300">
              Matland Gård
            </h1>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white hover:text-[var(--color-accent)] focus:outline-none cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`font-medium transition-colors hover:text-[var(--color-accent)] ${pathname === link.href ? 'text-[var(--color-accent)]' : 'text-white'
                      }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Cart Icon - Only show on /nettbutikk page */}
            {pathname?.startsWith('/nettbutikk') && (
              <Link
                href="/handlekurv"
                className="relative text-white hover:text-[var(--color-accent)] transition-colors hover:scale-110 duration-200"
                aria-label="Handlekurv"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[var(--color-accent)] text-[var(--color-dark)] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
            }`}
        >
          <ul className="flex flex-col space-y-4 pt-2 border-t border-gray-700">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block text-lg font-medium px-2 py-1 rounded transition-colors ${pathname === link.href
                    ? 'bg-[var(--color-primary)] text-[var(--color-accent)]'
                    : 'text-white hover:bg-[var(--color-primary)]'
                    }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {pathname?.startsWith('/nettbutikk') && (
              <li>
                <Link href="/handlekurv" className="flex items-center space-x-2 text-white hover:text-[var(--color-accent)] px-2 py-1">
                  <span>Handlevogn</span>
                  {totalItems > 0 && (
                    <span className="bg-[var(--color-accent)] text-[var(--color-dark)] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
