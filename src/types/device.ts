export type DeviceType = 'phone' | 'tablet' | 'laptop' | 'desktop' | 'unknown'

export interface DeviceInfo {
  peerId: string
  name: string
  type: DeviceType
  browser: string
  os: string
}

export interface PeerDevice {
  peerId: string
  deviceName: string
  deviceType: DeviceType
}
