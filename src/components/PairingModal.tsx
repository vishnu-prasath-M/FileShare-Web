import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { formatPairingCode } from '../utils/session'
import { Copy, Check, Share2, X, Smartphone, ArrowRight, Camera } from 'lucide-react'

interface PairingModalProps {
  isOpen: boolean
  onClose: () => void
  code: string
  onOpenScanner?: () => void
  onManualCode?: () => void
}

export const PairingModal: React.FC<PairingModalProps> = ({
  isOpen,
  onClose,
  code,
  onOpenScanner,
  onManualCode
}) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const connectionUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?join=${code}`
    : `https://droplink.app/?join=${code}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(connectionUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'DropLink Direct Connection',
          text: `Connect to my device on DropLink using code: ${formatPairingCode(code)}`,
          url: connectionUrl
        })
      } catch {}
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#12141c] border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-3">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Connect Another Device</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Open DropLink on your other device and scan this QR code or enter the code.
          </p>
        </div>

        {/* 6-Digit Pairing Code Display */}
        <div className="my-6 p-4 rounded-2xl bg-[#171b26] border border-white/[0.06] text-center">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
            Pairing Code
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-sky-400">
            {formatPairingCode(code)}
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center">
          <div className="p-4 bg-white rounded-2xl shadow-xl shadow-black/40">
            <QRCodeSVG
              value={connectionUrl}
              size={180}
              level="M"
              includeMargin={false}
            />
          </div>
          <span className="text-[11px] text-zinc-400 mt-3">
            Scan with iPhone Camera, Android Camera, or QR scanner
          </span>
        </div>

        {/* Copy / Share Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1a1d28] hover:bg-[#232736] border border-white/[0.08] text-xs font-medium text-zinc-200 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
            <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-xs font-medium text-sky-400 hover:text-sky-300 transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Link</span>
          </button>
        </div>

        {/* Enter Code or Scan Option */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col gap-2 text-center">
          {onOpenScanner && (
            <button
              onClick={() => {
                onClose()
                onOpenScanner()
              }}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan a QR code from another device instead</span>
            </button>
          )}

          {onManualCode && (
            <button
              onClick={() => {
                onClose()
                onManualCode()
              }}
              className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
            >
              <span>Have a 6-digit code? Enter it here</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
