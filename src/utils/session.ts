/**
 * Generates an unpredictable 6-digit pairing code (100000 - 999999)
 */
export function generatePairingCode(): string {
  // Use crypto for cryptographically strong random values
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const code = 100000 + (array[0] % 900000)
  return code.toString()
}

/**
 * Formats a 6-digit code with a clean center space: "482 719"
 */
export function formatPairingCode(code: string): string {
  const clean = code.replace(/\D/g, '')
  if (clean.length <= 3) return clean
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)}`
}

/**
 * Normalizes input code by removing spaces, dashes, etc.
 */
export function normalizePairingCode(input: string): string {
  return input.replace(/[\s-]/g, '').trim()
}

/**
 * Validates whether the code is a valid 6-digit code
 */
export function isValidPairingCode(code: string): boolean {
  const normalized = normalizePairingCode(code)
  return /^\d{6}$/.test(normalized)
}

/**
 * Generates an ephemeral unique peer ID
 */
export function generatePeerId(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
