import { describe, expect, it } from 'vitest';
import { validateEmail } from './email';

describe('validateEmail', () => {
  it.each(['a@b.co', 'first.last+tag@sub.example.com', '  padded@example.org  '])(
    'accepts %s',
    (v) => expect(validateEmail(v)).toEqual({ ok: true }),
  );

  it('reports an empty value', () => {
    expect(validateEmail('')).toEqual({ ok: false, reason: 'empty' });
    expect(validateEmail('   ')).toEqual({ ok: false, reason: 'empty' });
  });

  it.each([
    'plain',
    'no@tld',
    '@example.com',
    'a@@b.com',
    'a b@example.com',
    'a..b@example.com',
    '.a@example.com',
    'a@-example.com',
    'a@example..com',
    'a@example.c',
    `${'x'.repeat(65)}@example.com`,
  ])('rejects %s', (v) => expect(validateEmail(v)).toEqual({ ok: false, reason: 'invalid' }));
});
