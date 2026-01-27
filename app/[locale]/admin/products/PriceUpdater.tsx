
'use client';

import { useState } from 'react';

interface PriceUpdaterProps {
    productId: string;
    currentPrice: number; // in cents (øre)
}

export default function PriceUpdater({ productId, currentPrice }: PriceUpdaterProps) {
    const [price, setPrice] = useState(currentPrice);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState((currentPrice / 100).toString());

    const updatePrice = async (newPrice: number) => { // newPrice in cents
        if (newPrice < 0) return;

        setIsUpdating(true);
        try {
            const response = await fetch('/api/admin/products/update-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    price: newPrice,
                }),
            });

            if (response.ok) {
                setPrice(newPrice);
                setShowInput(false);
            } else {
                alert('Kunne ikke oppdatere pris');
            }
        } catch (error) {
            console.error('Error updating price:', error);
            alert('Kunne ikke oppdatere pris');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newPriceNOK = parseFloat(inputValue.replace(',', '.'));
        if (!isNaN(newPriceNOK) && newPriceNOK >= 0) {
            updatePrice(Math.round(newPriceNOK * 100));
        }
    };

    if (showInput) {
        return (
            <form onSubmit={handleInputSubmit} className="flex items-center gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700"
                    disabled={isUpdating}
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed"
                >
                    OK
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setShowInput(false);
                        setInputValue((price / 100).toString());
                    }}
                    disabled={isUpdating}
                    className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 disabled:bg-gray-200 cursor-pointer disabled:cursor-not-allowed"
                >
                    Avbryt
                </button>
            </form>
        );
    }

    return (
        <button
            onClick={() => {
                setInputValue((price / 100).toString());
                setShowInput(true);
            }}
            disabled={isUpdating}
            className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-[var(--color-primary)] hover:underline decoration-dashed underline-offset-4 cursor-pointer group"
            title="Klikk for å endre pris"
        >
            <span>{(price / 100).toLocaleString('nb-NO')} kr</span>
            <span className="text-gray-400">✎</span>
        </button>
    );
}
