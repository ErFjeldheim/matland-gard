'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';

export default function Navigation() {
  const { totalItems } = useCart();
  const pathname = usePathname();
  
  return (
    <nav className="bg-[var(--color-dark)]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-white hover:text-[var(--color-accent)] transition-colors">
              Matland Gard
            </h1>
          </Link>

          {/* Navigation Links */}
          <ul className="flex space-x-8">
            <li>
              <Link 
                href="/singel" 
                className="text-white hover:text-[var(--color-accent)] transition-colors font-medium"
              >
                Singel & Stein
              </Link>
            </li>
            <li>
              <Link 
                href="/camping" 
                className="text-white hover:text-[var(--color-accent)] transition-colors font-medium"
              >
                Camping
              </Link>
            </li>
            <li>
              <Link 
                href="/arrangement" 
                className="text-white hover:text-[var(--color-accent)] transition-colors font-medium"
              >
                Arrangement
              </Link>
            </li>
          </ul>
          
          {/* Cart Icon - Only show on /singel page */}
          {pathname?.startsWith('/singel') && (
            <Link 
              href="/handlekurv"
              className="relative text-white hover:text-[var(--color-accent)] transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
