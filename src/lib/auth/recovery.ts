/** Strapi generates a 64-byte hexadecimal reset token. */
export function isPasswordResetCode(code: unknown): code is string {
  return typeof code === 'string' && /^[a-f0-9]{128}$/i.test(code);
}
