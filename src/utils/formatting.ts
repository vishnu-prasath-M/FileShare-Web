/**
 * Formats byte count into human-readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const idx = Math.min(i, sizes.length - 1)
  const val = parseFloat((bytes / Math.pow(k, idx)).toFixed(dm))
  return `${val} ${sizes[idx]}`
}

/**
 * Formats transfer rate (bytes per second)
 */
export function formatSpeed(bytesPerSec: number): string {
  if (!bytesPerSec || bytesPerSec <= 0 || !isFinite(bytesPerSec)) {
    return '0 B/s'
  }
  return `${formatBytes(bytesPerSec, 1)}/s`
}

/**
 * Formats ETA seconds into human-readable display
 */
export function formatTimeRemaining(seconds: number): string {
  if (!seconds || seconds <= 0 || !isFinite(seconds)) {
    return 'Calculating...'
  }
  const rounded = Math.ceil(seconds)
  if (rounded < 60) {
    return `${rounded}s`
  }
  const mins = Math.floor(rounded / 60)
  const secs = rounded % 60
  if (mins < 60) {
    return `${mins}m ${secs}s`
  }
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return `${hours}h ${remainingMins}m`
}

/**
 * Sanitizes file names to prevent path traversal, HTML injection or OS issues
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return 'download'
  // Remove any path traversal / slashes
  const cleanName = fileName.replace(/[/\\?%*:|"<>]/g, '_').trim()
  // Truncate to reasonable length preserving extension
  if (cleanName.length > 200) {
    const extIdx = cleanName.lastIndexOf('.')
    if (extIdx !== -1 && cleanName.length - extIdx < 15) {
      const ext = cleanName.substring(extIdx)
      return cleanName.substring(0, 200 - ext.length) + ext
    }
    return cleanName.substring(0, 200)
  }
  return cleanName || 'download'
}
