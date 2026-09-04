import type { DeviceInfo, DeviceType } from '../types/device'
import { generatePeerId } from './session'

export function detectDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      peerId: generatePeerId(),
      name: 'Unknown Device',
      type: 'unknown',
      browser: 'Unknown',
      os: 'Unknown'
    }
  }

  const ua = navigator.userAgent
  let os = 'Unknown OS'
  let browser = 'Unknown Browser'
  let type: DeviceType = 'desktop'

  // OS detection
  if (/iPad|iPhone|iPod/.test(ua)) {
    os = 'iOS'
    type = /iPad/.test(ua) ? 'tablet' : 'phone'
  } else if (/Android/.test(ua)) {
    os = 'Android'
    type = /Mobile/.test(ua) ? 'phone' : 'tablet'
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    os = 'macOS'
    type = 'laptop'
  } else if (/Windows/.test(ua)) {
    os = 'Windows'
    type = 'laptop'
  } else if (/Linux/.test(ua)) {
    os = 'Linux'
    type = 'desktop'
  }

  // Browser detection
  if (/Edg/.test(ua)) {
    browser = 'Edge'
  } else if (/Chrome/.test(ua) && !/Chromium|Edg/.test(ua)) {
    browser = 'Chrome'
  } else if (/Safari/.test(ua) && !/Chrome|Edg/.test(ua)) {
    browser = 'Safari'
  } else if (/Firefox/.test(ua)) {
    browser = 'Firefox'
  }

  // Default friendly name
  let name = ''
  if (os === 'iOS') {
    name = type === 'tablet' ? 'iPad' : 'iPhone'
  } else if (os === 'Android') {
    name = type === 'tablet' ? 'Android Tablet' : 'Android Phone'
  } else if (os === 'macOS') {
    name = 'MacBook'
  } else if (os === 'Windows') {
    name = 'Windows Laptop'
  } else {
    name = `${browser} on ${os}`
  }

  // Check saved custom name in localStorage
  const savedName = localStorage.getItem('droplink_device_name')
  if (savedName && savedName.trim().length > 0) {
    name = savedName.trim()
  }

  let peerId = sessionStorage.getItem('droplink_peer_id')
  if (!peerId) {
    peerId = generatePeerId()
    sessionStorage.setItem('droplink_peer_id', peerId)
  }

  return {
    peerId,
    name,
    type,
    browser,
    os
  }
}
