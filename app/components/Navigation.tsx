import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-green-700 border-b border-green-600">
      <div className="container mx-auto px-4">
        <ul className="flex space-x-8 py-4">
          <li>
            <Link 
              href="/singel" 
              className="text-white hover:text-green-200 transition-colors font-medium"
            >
              Singel & Stein
            </Link>
          </li>
          <li>
            <Link 
              href="/camping" 
              className="text-white hover:text-green-200 transition-colors font-medium"
            >
              Camping
            </Link>
          </li>
          <li>
            <Link 
              href="/arrangement" 
              className="text-white hover:text-green-200 transition-colors font-medium"
            >
              Arrangement
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
