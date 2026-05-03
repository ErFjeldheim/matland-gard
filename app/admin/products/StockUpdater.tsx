
'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';

interface StockUpdaterProps {
  productId: string;
  currentStock: number;
  stockUnit: string;
}

export default function StockUpdater({ productId, currentStock, stockUnit }: StockUpdaterProps) {
  const [stock, setStock] = useState(currentStock ?? 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState((currentStock ?? 0).toString());

  const getUnitText = (amount: number, unit: string) => {
    if (unit === 'storsekk' && amount !== 1) {
      return 'storsekker';
    }
    return unit || 'storsekk';
  };

  const updateStock = async (newStock: number) => {
    if (newStock < 0) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/products/update-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          stock: newStock,
        }),
      });

      if (response.ok) {
        setStock(newStock);
        setShowInput(false);
      } else {
        alert('Kunne ikke oppdatere lagerbeholdning');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Kunne ikke oppdatere lagerbeholdning');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStock = parseInt(inputValue);
    if (!isNaN(newStock) && newStock >= 0) {
      updateStock(newStock);
    }
  };

  if (showInput) {
    return (
      <form onSubmit={handleInputSubmit} className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700"
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
            setInputValue(stock.toString());
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
        setInputValue(stock.toString());
        setShowInput(true);
      }}
      disabled={isUpdating}
      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-[var(--color-primary)] hover:underline decoration-dashed underline-offset-4 cursor-pointer group"
      title="Klikk for å endre lagerbeholdning"
    >
      <span>{stock} {getUnitText(stock, stockUnit || 'storsekk')}</span>
      <Pencil className="h-4 w-4 text-gray-400" />
    </button>
  );
}
