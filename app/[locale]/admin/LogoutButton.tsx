'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="bg-[var(--color-dark)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary)] transition-colors font-medium disabled:bg-gray-400 cursor-pointer"
    >
      {loading ? 'Logger ut...' : 'Logg ut'}
    </button>
  );
}
