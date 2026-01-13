'use client';

import { useState } from 'react';

interface Setting {
    key: string;
    value: string;
    type: string;
}

interface SettingsClientProps {
    initialSettings: Setting[];
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
    const [settings, setSettings] = useState<Setting[]>(initialSettings);
    const [loading, setLoading] = useState<string | null>(null);

    const handleUpdate = async (key: string, value: string) => {
        setLoading(key);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key, value }),
            });

            if (!response.ok) {
                throw new Error('Feil ved oppdatering');
            }

            setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Ein feil oppstod');
        } finally {
            setLoading(null);
        }
    };

    const categories = [
        {
            title: 'Prisar (NOK)',
            settings: settings.filter(s => s.key.includes('price') || s.key.includes('fixed')),
        },
        {
            title: 'Innhald',
            settings: settings.filter(s => !s.key.includes('price') && !s.key.includes('fixed')),
        },
    ];

    const formatKey = (key: string) => {
        return key
            .replace(/_/g, ' ')
            .replace('herregardssingel', 'Herregårdssingel')
            .replace('price', 'pris')
            .replace('shipping', 'frakt')
            .replace('contact', 'kontakt')
            .replace('hero', 'forside')
            .replace('title', 'tittel')
            .replace('season', 'sesong')
            .replace('season', 'sesong')
            .replace('text', 'tekst')
            .replace('address', 'adresse')
            .replace('phone', 'telefon')
            .replace('email', 'e-post')
            .replace('image url', 'bilete (URL)')
            .replace('image', 'bilete');
    };

    return (
        <div className="space-y-8">
            {categories.map((cat) => (
                <div key={cat.title} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">{cat.title}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {cat.settings.map((setting) => (
                            <div key={setting.key} className="flex flex-col md:flex-row md:items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                                <div className="md:w-1/3">
                                    <label className="block text-sm font-semibold text-gray-700 capitalize">
                                        {formatKey(setting.key)}
                                    </label>
                                </div>
                                <div className="flex-grow flex gap-2">
                                    <input
                                        type={setting.type === 'number' ? 'number' : 'text'}
                                        value={setting.value}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: newValue } : s));
                                        }}
                                        className="flex-grow bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                    />
                                    <button
                                        onClick={() => handleUpdate(setting.key, setting.value)}
                                        disabled={loading === setting.key}
                                        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-dark)] transition-colors disabled:opacity-50"
                                    >
                                        {loading === setting.key ? 'Lagrar...' : 'Lagre'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
