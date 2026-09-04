import { useState, useEffect } from 'react'
import type { DeviceInfo } from '../types/device'
import { detectDeviceInfo } from '../utils/deviceDetection'

export function useDevice() {
  const [device, setDevice] = useState<DeviceInfo>(() => detectDeviceInfo())

  const updateDeviceName = (newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    localStorage.setItem('droplink_device_name', trimmed)
    setDevice((prev) => ({ ...prev, name: trimmed }))
  }

  useEffect(() => {
    const current = detectDeviceInfo()
    setDevice(current)
  }, [])

  return {
    device,
    updateDeviceName
  }
}
