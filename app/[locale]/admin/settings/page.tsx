import { prisma } from '@/lib/prisma';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('admin-auth')?.value === 'authenticated';

    if (!isAuthenticated) {
        redirect('/admin/login');
    }

    const settings = await prisma.setting.findMany({
        orderBy: {
            key: 'asc'
        }
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-[var(--color-dark)] text-white">
                <Navigation />
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link href="/admin" className="text-[var(--color-primary)] hover:underline mb-2 inline-block">
                            &larr; Tilbake til kontrollpanel
                        </Link>
                        <h1 className="text-4xl font-bold text-gray-900">Innstillingar</h1>
                    </div>
                </div>

                <SettingsClient initialSettings={settings} />
            </main>

            <Footer />
        </div>
    );
}
