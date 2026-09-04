import { describe, it, expect } from 'vitest'
import { formatBytes, formatSpeed, formatTimeRemaining, sanitizeFileName } from '../formatting'

describe('formatting utils', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(1073741824)).toBe('1 GB')
    expect(formatBytes(1572864)).toBe('1.5 MB')
  })

  it('formats transfer speed', () => {
    expect(formatSpeed(0)).toBe('0 B/s')
    expect(formatSpeed(10485760)).toBe('10 MB/s')
    expect(formatSpeed(5242880)).toBe('5 MB/s')
  })

  it('formats time remaining accurately', () => {
    expect(formatTimeRemaining(0)).toBe('Calculating...')
    expect(formatTimeRemaining(-5)).toBe('Calculating...')
    expect(formatTimeRemaining(4)).toBe('4s')
    expect(formatTimeRemaining(65)).toBe('1m 5s')
    expect(formatTimeRemaining(3665)).toBe('1h 1m')
  })

  it('sanitizes potentially harmful file names', () => {
    expect(sanitizeFileName('../../etc/passwd')).toBe('.._.._etc_passwd')
    expect(sanitizeFileName('my<photo>:test.jpg')).toBe('my_photo__test.jpg')
    expect(sanitizeFileName('normal_file.pdf')).toBe('normal_file.pdf')
    expect(sanitizeFileName('')).toBe('download')
  })
})
