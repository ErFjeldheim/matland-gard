'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = "Kopier" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-3 py-1 text-sm bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-dark)] transition-colors cursor-pointer"
    >
      {copied ? <Check className="h-4 w-4" /> : label}
    </button>
  );
}
