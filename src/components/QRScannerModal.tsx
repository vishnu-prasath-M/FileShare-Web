import React, { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, KeyRound, X, AlertCircle } from 'lucide-react'
import { normalizePairingCode } from '../utils/session'

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onCodeScanned: (code: string) => void
  initialTab?: 'scan' | 'code'
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onCodeScanned,
  initialTab = 'scan'
}) => {
  const [tab, setTab] = useState<'scan' | 'code'>(initialTab)
  const [inputCode, setInputCode] = useState('')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab, isOpen])

  // Camera start / stop effect
  useEffect(() => {
    if (!isOpen || tab !== 'scan') {
      stopCamera()
      return
    }

    const scannerId = 'droplink-qr-reader'
    setCameraError(null)

    const timer = setTimeout(() => {
      try {
        const scanner = new Html5Qrcode(scannerId)
        scannerRef.current = scanner

        scanner
          .start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 220, height: 220 }
            },
            (decodedText) => {
              // Extract pairing code from URL or text
              let code = decodedText
              try {
                const url = new URL(decodedText)
                const joinParam = url.searchParams.get('join')
                if (joinParam) {
                  code = joinParam
                }
              } catch {}

              const clean = normalizePairingCode(code)
              stopCamera()
              onCodeScanned(clean)
              onClose()
            },
            () => {
              // Ignore frame decode errors
            }
          )
          .then(() => {
            setIsScanning(true)
          })
          .catch((err) => {
            console.warn('Camera error:', err)
            setIsScanning(false)
            setCameraError(
              'Camera access was denied or is unavailable. You can enter the 6-digit code manually.'
            )
          })
      } catch (err: any) {
        setIsScanning(false)
        setCameraError(err?.message || 'Could not start camera')
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      stopCamera()
    }
  }, [isOpen, tab])

  const stopCamera = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear()
            scannerRef.current = null
          })
          .catch(() => {})
      } else {
        scannerRef.current.clear()
        scannerRef.current = null
      }
    }
    setIsScanning(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = normalizePairingCode(inputCode)
    if (clean.length === 6) {
      onCodeScanned(clean)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#12141c] border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={() => {
            stopCamera()
            onClose()
          }}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white tracking-tight text-center mb-5">
          Connect to a Device
        </h3>

        {/* Tab switch */}
        <div className="flex p-1 rounded-xl bg-[#1a1d28] border border-white/[0.06] mb-6">
          <button
            type="button"
            onClick={() => setTab('scan')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              tab === 'scan' ? 'bg-sky-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera()
              setTab('code')
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              tab === 'code' ? 'bg-sky-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Enter Code</span>
          </button>
        </div>

        {/* Scan View */}
        {tab === 'scan' && (
          <div>
            <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black border border-white/[0.1] flex items-center justify-center">
              <div id="droplink-qr-reader" className="w-full h-full" />
              {!isScanning && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mb-3" />
                  <span className="text-xs text-zinc-400">Requesting camera access...</span>
                </div>
              )}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/95">
                  <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="text-xs text-zinc-300 leading-relaxed mb-4">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => setTab('code')}
                    className="px-4 py-2 rounded-xl bg-sky-500 text-xs text-white font-medium cursor-pointer"
                  >
                    Enter Code Instead
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-400 text-center mt-4">
              Point your camera at the QR code displayed on the other device.
            </p>
          </div>
        )}

        {/* Enter Code View */}
        {tab === 'code' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                6-Digit Pairing Code
              </label>
              <input
                type="text"
                maxLength={7}
                placeholder="482 719"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 text-center text-2xl sm:text-3xl font-mono tracking-widest bg-[#1a1d28] border border-white/[0.1] focus:border-sky-400 rounded-2xl text-white outline-none transition-all placeholder:text-zinc-600"
              />
            </div>

            <button
              type="submit"
              disabled={normalizePairingCode(inputCode).length !== 6}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-white font-medium text-sm transition-all shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer"
            >
              Connect to Device
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
