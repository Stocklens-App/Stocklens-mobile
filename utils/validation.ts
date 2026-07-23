// Single source of truth for input rules. Mirrors the server-side patterns in
// AuthController — the backend remains the real guard; these give fast feedback.

export const NAME_REGEX = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'\-. ]{1,49}$/;
export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const PHONE_REGEX = /^0\d{9}$/;
export const OTP_REGEX = /^\d{6}$/;

export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 64;

/** Each validator returns an error message, or null when the value is fine. */

export function validateName(value: string | null | undefined): string | null {
  const v = (value || '').trim();
  if (!v) return 'Name is required.';
  if (!NAME_REGEX.test(v)) {
    return 'Name must be at least 2 letters and can only contain letters, spaces, hyphens and apostrophes.';
  }
  return null;
}

export function validateEmail(value: string | null | undefined): string | null {
  const v = (value || '').trim();
  if (!v) return 'Email address is required.';
  if (v.length > 254) return 'That email address is too long.';
  if (!EMAIL_REGEX.test(v)) return 'Enter a valid email address, e.g. name@example.com';
  return null;
}

export function validatePhone(value: string | null | undefined): string | null {
  const v = (value || '').trim();
  if (!v) return 'Phone number is required.';
  if (!PHONE_REGEX.test(v)) return 'Enter a 10-digit number starting with 0, e.g. 0245173765';
  return null;
}

export function validatePassword(value: string | null | undefined): string | null {
  const v = (value || '').trim();
  if (!v) return 'Password is required.';
  if (v.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (v.length > MAX_PASSWORD_LENGTH) return `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`;
  return null;
}

export function validateOtp(value: string | null | undefined): string | null {
  const v = (value || '').trim();
  if (!v) return 'Enter the code from your email.';
  if (!OTP_REGEX.test(v)) return 'The code is 6 digits.';
  return null;
}

/** Strips characters that aren't allowed, for use in onChangeText. */
export const sanitizeName = (v: string | null | undefined): string =>
  (v || '').replace(/[^A-Za-zÀ-ÿ'\-. ]/g, '').slice(0, 50);

export const sanitizeDigits = (v: string | null | undefined, max: number): string =>
  (v || '').replace(/[^0-9]/g, '').slice(0, max);