'use client';

import { useState } from 'react';

interface ActiveToggleProps {
  productId: string;
  initialActive: boolean;
}

export default function ActiveToggle({ productId, initialActive }: ActiveToggleProps) {
  const [isActive, setIsActive] = useState(initialActive);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/products/toggle-active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          isActive: !isActive,
        }),
      });

      if (response.ok) {
        setIsActive(!isActive);
      } else {
        alert('Kunne ikke oppdatere produktstatus');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Kunne ikke oppdatere produktstatus');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${isActive ? 'bg-green-600' : 'bg-gray-300'}
        ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span className="sr-only">Toggle product active status</span>
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${isActive ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}
