import React from 'react'
import type { ConnectionStatus } from '../types/signaling'
import type { PeerDevice } from '../types/device'
import {
  Share2,
  Settings,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Radio,
  ArrowRight
} from 'lucide-react'

interface HeaderProps {
  status: ConnectionStatus
  connectedPeer: PeerDevice | null
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onOpenSettings: () => void
  onStartSharing?: () => void
  currentPage: 'landing' | 'app'
  onNavigate: (page: 'landing' | 'app') => void
}

export const Header: React.FC<HeaderProps> = ({
  status,
  connectedPeer,
  theme,
  onToggleTheme,
  onOpenSettings,
  currentPage,
  onNavigate
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-white/[0.07] bg-[#090a0f]/80 dark:bg-[#090a0f]/80 light:bg-white/80 light:border-black/[0.06] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white light:text-zinc-900">
                DropLink
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                P2P
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-zinc-400 light:text-zinc-500 font-normal leading-none -mt-0.5">
              Move files. Not through the cloud.
            </p>
          </div>
        </button>

        {/* Navigation & Connection State */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Connection Status Badge */}
          {currentPage === 'app' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-[#12141c] border-white/[0.08] text-zinc-300 light:bg-zinc-100 light:border-zinc-300 light:text-zinc-700">
              {status === 'connected' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                    {connectedPeer ? connectedPeer.deviceName : 'Connected'}
                  </span>
                </>
              ) : status === 'waiting' ? (
                <>
                  <Radio className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>Waiting for peer...</span>
                </>
              ) : status === 'connecting' ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Not connected</span>
                </>
              )}
            </div>
          )}

          {/* Landing page nav links */}
          {currentPage === 'landing' && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400 light:text-zinc-600">
              <a href="#how-it-works" className="hover:text-white light:hover:text-zinc-900 transition-colors">
                How it works
              </a>
              <a href="#features" className="hover:text-white light:hover:text-zinc-900 transition-colors">
                Features
              </a>
              <a href="#privacy" className="hover:text-white light:hover:text-zinc-900 transition-colors">
                Privacy
              </a>
              <a href="#faq" className="hover:text-white light:hover:text-zinc-900 transition-colors">
                FAQ
              </a>
            </nav>
          )}

          {/* Action Button */}
          {currentPage === 'landing' ? (
            <button
              onClick={() => onNavigate('app')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/25 active:scale-95 cursor-pointer"
            >
              <span>Start Sharing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('landing')}
              className="hidden sm:block text-xs font-medium text-zinc-400 hover:text-white light:text-zinc-600 light:hover:text-zinc-900 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/[0.08] transition-all"
            >
              Landing Page
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-zinc-400 hover:text-white light:text-zinc-600 light:hover:text-zinc-900 hover:bg-white/[0.05] light:hover:bg-zinc-100 transition-colors border border-transparent hover:border-white/[0.06] cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-2 rounded-xl text-zinc-400 hover:text-white light:text-zinc-600 light:hover:text-zinc-900 hover:bg-white/[0.05] light:hover:bg-zinc-100 transition-colors border border-transparent hover:border-white/[0.06] cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
