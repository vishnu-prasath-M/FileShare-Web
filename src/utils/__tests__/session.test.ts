import { describe, it, expect } from 'vitest'
import {
  generatePairingCode,
  formatPairingCode,
  normalizePairingCode,
  isValidPairingCode,
  generatePeerId
} from '../session'

describe('session utils', () => {
  it('generates a 6-digit numeric pairing code', () => {
    const code = generatePairingCode()
    expect(code).toMatch(/^\d{6}$/)
    expect(parseInt(code, 10)).toBeGreaterThanOrEqual(100000)
    expect(parseInt(code, 10)).toBeLessThanOrEqual(999999)
  })

  it('formats pairing codes for human readability', () => {
    expect(formatPairingCode('482719')).toBe('482 719')
    expect(formatPairingCode('123')).toBe('123')
  })

  it('normalizes pairing codes from user input', () => {
    expect(normalizePairingCode('482 719')).toBe('482719')
    expect(normalizePairingCode('482-719')).toBe('482719')
    expect(normalizePairingCode('  482 719  ')).toBe('482719')
  })

  it('validates 6-digit codes properly', () => {
    expect(isValidPairingCode('482719')).toBe(true)
    expect(isValidPairingCode('482 719')).toBe(true)
    expect(isValidPairingCode('482-719')).toBe(true)
    expect(isValidPairingCode('12345')).toBe(false)
    expect(isValidPairingCode('1234567')).toBe(false)
    expect(isValidPairingCode('abcdef')).toBe(false)
  })

  it('generates random peer IDs', () => {
    const p1 = generatePeerId()
    const p2 = generatePeerId()
    expect(p1).not.toBe(p2)
    expect(p1.length).toBe(16)
  })
})
