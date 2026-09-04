import React, { useState } from 'react'
import type { DeviceInfo } from '../types/device'
import {
  X,
  Smartphone,
  Check,
  Moon,
  Sun,
  Shield,
  Zap,
  Download
} from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  device: DeviceInfo
  onUpdateDeviceName: (name: string) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  autoDownload: boolean
  onToggleAutoDownload: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  device,
  onUpdateDeviceName,
  theme,
  onToggleTheme,
  autoDownload,
  onToggleAutoDownload
}) => {
  const [nameInput, setNameInput] = useState(device.name)
  const [isSaved, setIsSaved] = useState(false)

  if (!isOpen) return null

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateDeviceName(nameInput)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#12141c] border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 className="text-lg font-bold text-white tracking-tight">Settings</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Name setting */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>Device Display Name</span>
          </label>
          <form onSubmit={handleSaveName} className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Harry's MacBook"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#1a1d28] border border-white/[0.08] text-sm text-white focus:border-sky-400 outline-none transition-all placeholder:text-zinc-600"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </form>
          <p className="text-[11px] text-zinc-500">
            Detected: {device.browser} on {device.os} ({device.type})
          </p>
        </div>

        {/* Preferences */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
            Preferences
          </span>

          {/* Theme Row */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171b26] border border-white/[0.04]">
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <div>
                <p className="text-xs font-medium text-zinc-200">Appearance Theme</p>
                <p className="text-[10px] text-zinc-500">Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-lg bg-[#232736] hover:bg-[#2b3042] text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
            >
              Toggle
            </button>
          </div>

          {/* Auto Download Row */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171b26] border border-white/[0.04]">
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-medium text-zinc-200">Auto-Download Files</p>
                <p className="text-[10px] text-zinc-500">Automatically prompt download upon completion</p>
              </div>
            </div>
            <button
              onClick={onToggleAutoDownload}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                autoDownload ? 'bg-sky-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 ${
                  autoDownload ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-2xl bg-[#171b26] border border-white/[0.04] flex items-start gap-3">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-zinc-400 leading-relaxed">
            <strong className="text-zinc-200 block mb-0.5">Privacy Architecture</strong>
            DropLink transmits file packets directly over peer-to-peer WebRTC DataChannels. The signaling server coordinates connection metadata and never inspects or archives your files.
          </div>
        </div>

        {/* Version footer */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
          <span>DropLink v1.0.0</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-sky-400" /> WebRTC P2P
          </span>
        </div>
      </div>
    </div>
  )
}
