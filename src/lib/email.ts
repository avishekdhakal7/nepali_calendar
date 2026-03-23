/**
 * Normalize an email address: strip whitespace and convert to lowercase.
 * Use before storing or sending to the API.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
