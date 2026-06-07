import { describe, it, expect } from 'vitest';
import { escapeHtml } from '@/lib/email';

describe('escapeHtml', () => {
    it('escapes < and > to prevent script injection', () => {
        expect(escapeHtml('<script>alert("xss")</script>'))
            .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('escapes ampersands so they are not double-escaped', () => {
        expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('escapes both single and double quotes', () => {
        expect(escapeHtml(`O'Brien said "hi"`))
            .toBe('O&#39;Brien said &quot;hi&quot;');
    });

    it('leaves plain text unchanged', () => {
        expect(escapeHtml('Ola Nordmann')).toBe('Ola Nordmann');
    });

    it('leaves Norwegian characters unchanged', () => {
        expect(escapeHtml('ÆØÅ æøå ååå')).toBe('ÆØÅ æøå ååå');
    });

    it('returns empty string for null and undefined', () => {
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml(undefined)).toBe('');
    });

    it('returns empty string for empty input', () => {
        expect(escapeHtml('')).toBe('');
    });

    it('escapes attribute-breaking characters', () => {
        // A malicious address that tries to break out of an href attribute.
        const evil = `" onmouseover="alert(1)`;
        expect(escapeHtml(evil)).toBe('&quot; onmouseover=&quot;alert(1)');
    });
});
