import { describe, expect, it } from 'vitest';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

describe('password policy', () => {
  it('accepts valid password', () => {
    expect(passwordRegex.test('RolMaster2026!')).toBe(true);
  });

  it('rejects weak password', () => {
    expect(passwordRegex.test('short1!')).toBe(false);
  });
});
