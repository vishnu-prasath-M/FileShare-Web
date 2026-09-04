import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { LandingPage } from './pages/LandingPage'
import { ShareApp } from './pages/ShareApp'
import { SettingsModal } from './components/SettingsModal'
import { ToastProvider } from './components/Toast'
import { useDevice } from './hooks/useDevice'
import { useWebRTC } from './hooks/useWebRTC'
import { AlertTriangle } from 'lucide-react'

export function AppContent() {
  const { device, updateDeviceName } = useDevice()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [autoDownload, setAutoDownload] = useState(true)
  const [currentPage, setCurrentPage] = useState<'landing' | 'app'>('landing')
  const [isWebRTCSupported, setIsWebRTCSupported] = useState(true)

  const {
    status,
    roomId,
    connectedPeer,
    errorMessage,
    isDataChannelReady,
    transferEngine,
    createSession,
    joinSession,
    leaveSession
  } = useWebRTC(device)

  // Check WebRTC browser capability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = !!(
        window.RTCPeerConnection &&
        window.crypto &&
        window.crypto.subtle
      )
      setIsWebRTCSupported(supported)
    }
  }, [])

  // Check if opened with ?join=
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('join')) {
        setCurrentPage('app')
      }
    }
  }, [])

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-white light:bg-slate-50 light:text-zinc-900 transition-colors duration-200">
      {/* WebRTC Capability Warning banner if unsupported */}
      {!isWebRTCSupported && (
        <div className="bg-rose-950/80 border-b border-rose-500/30 p-3 text-center text-xs text-rose-200 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            Your browser does not fully support WebRTC DataChannels or Web Crypto. Please upgrade to a modern browser like Chrome, Safari, Edge, or Firefox.
          </span>
        </div>
      )}

      {/* Persistent Navigation Header */}
      <Header
        status={status}
        connectedPeer={connectedPeer}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStartSharing={() => setCurrentPage('app')}
        currentPage={currentPage}
        onNavigate={(p) => setCurrentPage(p)}
      />

      {/* Main Pages */}
      <main className="flex-1 flex flex-col">
        {currentPage === 'landing' ? (
          <LandingPage onStartSharing={() => setCurrentPage('app')} />
        ) : (
          <ShareApp
            device={device}
            status={status}
            roomId={roomId}
            connectedPeer={connectedPeer}
            errorMessage={errorMessage}
            isDataChannelReady={isDataChannelReady}
            transferEngine={transferEngine}
            onCreateSession={createSession}
            onJoinSession={joinSession}
            onLeaveSession={leaveSession}
            autoDownload={autoDownload}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        device={device}
        onUpdateDeviceName={updateDeviceName}
        theme={theme}
        onToggleTheme={toggleTheme}
        autoDownload={autoDownload}
        onToggleAutoDownload={() => setAutoDownload((prev) => !prev)}
      />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
