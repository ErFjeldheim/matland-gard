import { describe, it, expect } from 'vitest';
import { HEAD } from '@/app/api/health/live/route';

describe('/api/health/live', () => {
    it('returns 200 for HEAD', () => {
        const res = HEAD();
        expect(res.status).toBe(200);
    });

    it('sets cache-control no-store', () => {
        const res = HEAD();
        expect(res.headers.get('cache-control')).toBe('no-store');
    });

    it('sets x-health-check: live header', () => {
        const res = HEAD();
        expect(res.headers.get('x-health-check')).toBe('live');
    });

    it('returns an empty body', () => {
        const res = HEAD();
        expect(res.body).toBeNull();
    });
});
