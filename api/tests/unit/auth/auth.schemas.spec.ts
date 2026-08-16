import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '../../../src/modules/auth/interfaces/schemas/auth.schemas.js';

describe('auth schemas', () => {
  it('normalizes registration fields', () => {
    expect(registerSchema.parse({ fullName: ' Ada ', email: ' ADA@EXAMPLE.COM ', password: 'password' })).toEqual({ fullName: 'Ada', email: 'ada@example.com', password: 'password' });
  });

  it('accepts accented names with spaces', () => {
    expect(registerSchema.parse({ fullName: ' María José ', email: 'maria@example.com', password: 'password' }).fullName).toBe('María José');
  });

  it('rejects numbers and special characters in full names', () => {
    for (const fullName of ['Ada2 Lovelace', 'Ana-López', "O'Connor", 'Ana@Casa']) {
      expect(() => registerSchema.parse({ fullName, email: 'ana@example.com', password: 'password' })).toThrow();
    }
  });

  it('rejects short passwords and unknown fields', () => {
    expect(() => loginSchema.parse({ email: 'ada@example.com', password: 'short' })).toThrow();
    expect(() => loginSchema.parse({ email: 'ada@example.com', password: 'password', extra: true })).toThrow();
  });
});
