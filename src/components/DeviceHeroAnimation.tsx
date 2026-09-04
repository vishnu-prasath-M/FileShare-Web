import React, { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Lock, Smartphone, Laptop, Image as ImageIcon, CheckCircle2 } from 'lucide-react'

export const DeviceHeroAnimation: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const [percent, setPercent] = useState(64)
  const [activeFile, setActiveFile] = useState('IMG_4812.heic')

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          setActiveFile((curr) => (curr === 'IMG_4812.heic' ? 'Design_System_v2.fig' : 'IMG_4812.heic'))
          return 0
        }
        return prev + 2
      })
    }, 150)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="relative rounded-3xl bg-gradient-to-b from-[#131622] to-[#0d0f17] border border-white/[0.08] p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Subtle background ambient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.08),transparent_60%)] pointer-events-none" />

        {/* Top Status Bar */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-zinc-400 font-sans">Active P2P DataChannel</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 font-semibold">{percent}% Transferred</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-400 font-sans">
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            <span>DTLS 1.3 / SRTP Encrypted</span>
          </div>
        </div>

        {/* Devices & Stream Area */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 py-4">
          {/* Phone Device (Sender) */}
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-44 sm:w-48 bg-[#090a0f] rounded-2xl border-2 border-zinc-700/60 p-3 shadow-xl relative z-10"
          >
            {/* Dynamic Island / Notch */}
            <div className="w-14 h-3 bg-zinc-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
            </div>

            {/* Phone Screen */}
            <div className="bg-[#12141c] rounded-xl p-3 border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-white flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  iPhone 16 Pro
                </span>
                <span className="text-[10px] text-zinc-500">Sender</span>
              </div>

              {/* Active file card */}
              <div className="bg-zinc-900/90 rounded-lg p-2 border border-white/[0.05] flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-zinc-200 truncate">{activeFile}</p>
                  <p className="text-[9px] text-zinc-400">18.4 MB • Slicing</p>
                </div>
              </div>

              {/* Progress Bar inside Phone */}
              <div className="space-y-1 pt-1">
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-150 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500">
                  <span>Chunk {Math.min(288, Math.round((percent / 100) * 288))}/288</span>
                  <span>42.8 MB/s</span>
                </div>
              </div>
            </div>

            {/* Home indicator bar */}
            <div className="w-16 h-1 bg-zinc-700 rounded-full mx-auto mt-2" />
          </motion.div>

          {/* Center Connection Visualization & Flow */}
          <div className="relative flex-1 w-full px-4 flex flex-col items-center justify-center">
            {/* SVG Connecting Wire with pulsing beam */}
            <div className="relative w-full h-12 flex items-center justify-center">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-sky-500/20 via-sky-500/60 to-indigo-500/20" />

              {/* Traveling Particles */}
              {!shouldReduceMotion && (
                <>
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-sky-400/80 blur-[2px] shadow-lg shadow-sky-400"
                  />
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.8, delay: 0.6, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-400/80 blur-[2px] shadow-lg shadow-indigo-400"
                  />
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.8, delay: 1.2, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-300/80 blur-[1px]"
                  />
                </>
              )}

              {/* Central WebRTC Badge */}
              <div className="relative z-10 px-3 py-1 rounded-full bg-[#12141c] border border-sky-500/30 text-[11px] font-medium text-sky-300 shadow-xl flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                <span>Zero Server Storage</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 text-center mt-2">
              Direct NAT Traversal • 0 ms Cloud Latency
            </p>
          </div>

          {/* Laptop Device (Receiver) */}
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [3, -3, 3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-56 sm:w-64 bg-[#090a0f] rounded-xl border border-zinc-700/60 p-2 shadow-2xl relative z-10"
          >
            {/* Screen */}
            <div className="bg-[#12141c] rounded-lg p-3 border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-white flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                  MacBook Pro 16"
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">Receiver</span>
              </div>

              {/* Received files list */}
              <div className="space-y-1.5">
                <div className="bg-zinc-900/80 rounded p-1.5 border border-white/[0.04] flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-zinc-200 truncate">Document_Final.pdf</span>
                  </div>
                  <span className="text-zinc-500">4.2 MB</span>
                </div>

                <div className="bg-zinc-900/80 rounded p-1.5 border border-sky-500/20 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
                    <span className="text-sky-200 truncate">{activeFile}</span>
                  </div>
                  <span className="text-sky-400 font-medium">{percent}%</span>
                </div>
              </div>

              {/* Receiver Storage note */}
              <div className="text-[9px] text-zinc-500 text-right pt-0.5">
                Direct Browser Memory Stream
              </div>
            </div>

            {/* Laptop Base / Keyboard notch */}
            <div className="w-full h-2.5 bg-zinc-800 rounded-b-md mt-1.5 flex items-center justify-center">
              <div className="w-10 h-1 bg-zinc-900 rounded" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
