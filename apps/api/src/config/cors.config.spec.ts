import { describe, expect, it } from 'vitest';
import { getCorsConfiguration } from './cors.config.js';

describe('getCorsConfiguration', () => {
  it('uses localhost only as the development default', () => {
    expect(getCorsConfiguration(undefined, 'development')).toMatchObject({
      origin: ['http://localhost:3000'],
      credentials: false,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Accept', 'Authorization', 'Content-Type'],
    });
  });

  it('fails closed for browser origins in production without configuration', () => {
    expect(getCorsConfiguration(undefined, 'production')).toMatchObject({
      origin: false,
      credentials: false,
    });
  });

  it('parses an explicit origin allowlist without enabling credentials', () => {
    expect(
      getCorsConfiguration(
        'https://customer.example, https://another-customer.example',
        'production',
      ),
    ).toMatchObject({
      origin: ['https://customer.example', 'https://another-customer.example'],
      credentials: false,
    });
  });

  it('allows all origins only when explicitly configured for credential-free demos', () => {
    expect(getCorsConfiguration('*', 'production')).toMatchObject({
      origin: '*',
      credentials: false,
    });
  });

  it('rejects a wildcard mixed with specific origins', () => {
    expect(() =>
      getCorsConfiguration('*,https://customer.example', 'production'),
    ).toThrow('CORS_ALLOWED_ORIGINS');
  });
});
