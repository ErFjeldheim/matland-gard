'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/Navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin');
      } else {
        setError(data.error || 'Feil passord');
      }
    } catch (err) {
      setError('Noe gikk galt. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Kontrollpanel - Login
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Passord
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="Skriv inn admin-passord"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--color-dark)] transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Logger inn...' : 'Logg inn'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
