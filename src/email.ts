export type EmailCheck = { ok: true } | { ok: false; reason: 'empty' | 'invalid' };

export function validateEmail(raw: string): EmailCheck {
  const value = raw.trim();
  if (value === '') return { ok: false, reason: 'empty' };
  const [local = '', domain = ''] = value.split('@');
  const valid =
    value.split('@').length === 2 &&
    value.length <= 254 &&
    local.length > 0 &&
    local.length <= 64 &&
    !/\s/.test(value) &&
    !value.includes('..') &&
    !local.startsWith('.') &&
    !local.endsWith('.') &&
    /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(domain) &&
    !/(^-|-$|-\.|\.-)/.test(domain) &&
    /[a-z]{2,}$/i.test(domain);
  return valid ? { ok: true } : { ok: false, reason: 'invalid' };
}
