import React, { useState, useEffect } from 'react'
import type { DeviceInfo, PeerDevice } from '../types/device'
import type { ConnectionStatus } from '../types/signaling'
import { FileDropZone } from '../components/FileDropZone'
import { FileList } from '../components/FileList'
import { PairingModal } from '../components/PairingModal'
import { QRScannerModal } from '../components/QRScannerModal'
import { TransferProgress } from '../components/TransferProgress'
import { SuccessState } from '../components/SuccessState'
import { useFileTransfer } from '../hooks/useFileTransfer'
import { useToast } from '../components/Toast'
import { FileTransferEngine } from '../services/fileTransfer'
import {
  Send,
  QrCode,
  Smartphone,
  Laptop,
  AlertCircle
} from 'lucide-react'

interface ShareAppProps {
  device: DeviceInfo
  status: ConnectionStatus
  roomId: string | null
  connectedPeer: PeerDevice | null
  errorMessage: string | null
  isDataChannelReady: boolean
  transferEngine: FileTransferEngine | null
  onCreateSession: () => string
  onJoinSession: (code: string) => void
  onLeaveSession: () => void
  autoDownload: boolean
}

export const ShareApp: React.FC<ShareAppProps> = ({
  device: _device,
  status,
  roomId,
  connectedPeer,
  errorMessage,
  isDataChannelReady,
  transferEngine,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
  autoDownload
}) => {
  const { showToast } = useToast()
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false)
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false)
  const [scannerInitialTab, setScannerInitialTab] = useState<'scan' | 'code'>('scan')
  const [hasCompletedTransfer, setHasCompletedTransfer] = useState(false)

  const {
    outgoingFiles,
    incomingFiles,
    isTransferring,
    transferRole,
    overallSpeed,
    overallEta,
    isZipping,
    totalOutgoingBytes,
    transferredOutgoingBytes,
    overallOutgoingPercent,
    totalIncomingBytes,
    transferredIncomingBytes,
    overallIncomingPercent,
    addFiles,
    removeOutgoingFile,
    clearOutgoingFiles,
    startSending,
    cancelTransfer,
    downloadSingleFile,
    downloadAllAsZip
  } = useFileTransfer(transferEngine, { autoDownload })

  // Check URL query params for ?join=CODE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const joinCode = params.get('join')
      if (joinCode) {
        onJoinSession(joinCode)
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [onJoinSession])

  // Notifications for connection transitions
  useEffect(() => {
    if (status === 'connected' && connectedPeer) {
      showToast(`Connected with ${connectedPeer.deviceName}`, 'success')
      setIsPairingModalOpen(false)
      setIsScannerModalOpen(false)
    } else if (status === 'disconnected') {
      showToast('Peer disconnected', 'info')
    } else if (errorMessage) {
      showToast(errorMessage, 'error')
    }
  }, [status, connectedPeer, errorMessage, showToast])

  // Detect completion
  useEffect(() => {
    if (!isTransferring && (outgoingFiles.some((f) => f.status === 'completed') || incomingFiles.some((f) => f.status === 'completed'))) {
      setHasCompletedTransfer(true)
    }
  }, [isTransferring, outgoingFiles, incomingFiles])

  // Handle file drop when not in session: auto-create session and queue files
  const handleFilesChosen = (files: FileList | File[]) => {
    addFiles(files)
    showToast(`${Array.from(files).length} files queued`, 'info')

    if (!roomId) {
      onCreateSession()
      setIsPairingModalOpen(true)
    }
  }

  const handleStartShareClick = () => {
    if (!roomId) {
      onCreateSession()
    }
    setIsPairingModalOpen(true)
  }

  const handleOpenScanner = (tab: 'scan' | 'code' = 'scan') => {
    setScannerInitialTab(tab)
    setIsScannerModalOpen(true)
  }

  const handleSendMore = () => {
    setHasCompletedTransfer(false)
    clearOutgoingFiles()
  }

  const handleNewConnection = () => {
    setHasCompletedTransfer(false)
    clearOutgoingFiles()
    onLeaveSession()
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Connected Device Banner */}
      {status === 'connected' && connectedPeer && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              {connectedPeer.deviceType === 'phone' ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <Laptop className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight">
                  {connectedPeer.deviceName}
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Direct P2P Link
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">
                Ready for high-speed file transfer
              </p>
            </div>
          </div>

          <button
            onClick={onLeaveSession}
            className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Disconnect
          </button>
        </div>
      )}

      {/* Waiting for peer banner */}
      {status === 'waiting' && roomId && !isPairingModalOpen && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-sky-200">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-sky-400 animate-ping" />
            <div>
              <p className="text-sm font-semibold text-white">Waiting for device to pair...</p>
              <p className="text-xs text-sky-300/80">
                Pairing code: <strong className="font-mono text-white">{roomId}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPairingModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-sky-500 text-xs font-medium text-white hover:bg-sky-400 transition-colors cursor-pointer"
            >
              Show QR Code
            </button>
            <button
              onClick={onLeaveSession}
              className="px-3 py-1.5 rounded-lg border border-white/[0.1] text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Primary Content View Switcher */}
      {isTransferring ? (
        /* Live Transfer Progress Screen */
        <TransferProgress
          role={transferRole === 'sending' ? 'sending' : 'receiving'}
          peerName={connectedPeer ? connectedPeer.deviceName : 'Peer Device'}
          files={transferRole === 'sending' ? outgoingFiles : incomingFiles}
          overallPercent={transferRole === 'sending' ? overallOutgoingPercent : overallIncomingPercent}
          transferredBytes={transferRole === 'sending' ? transferredOutgoingBytes : transferredIncomingBytes}
          totalBytes={transferRole === 'sending' ? totalOutgoingBytes : totalIncomingBytes}
          speed={overallSpeed}
          eta={overallEta}
          onCancel={cancelTransfer}
        />
      ) : hasCompletedTransfer ? (
        /* Transfer Complete / Download Screen */
        <SuccessState
          role={incomingFiles.length > 0 ? 'receiver' : 'sender'}
          peerName={connectedPeer ? connectedPeer.deviceName : 'Connected Device'}
          files={incomingFiles.length > 0 ? incomingFiles : outgoingFiles}
          onSendMore={handleSendMore}
          onNewConnection={handleNewConnection}
          onDownloadSingle={downloadSingleFile}
          onDownloadAllAsZip={downloadAllAsZip}
          isZipping={isZipping}
        />
      ) : (
        /* Default Sharing Workspace */
        <div className="space-y-8">
          {/* Action Header Card when idle */}
          {status !== 'connected' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleStartShareClick}
                className="p-6 rounded-3xl bg-[#12141c] hover:bg-[#171b26] border border-white/[0.08] hover:border-sky-500/40 text-left transition-all group cursor-pointer shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Send className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white tracking-tight mb-1">
                  Send Files
                </h4>
                <p className="text-xs text-zinc-400">
                  Generate a pairing code and QR code to stream files directly to another phone or computer.
                </p>
              </button>

              <button
                onClick={() => handleOpenScanner('scan')}
                className="p-6 rounded-3xl bg-[#12141c] hover:bg-[#171b26] border border-white/[0.08] hover:border-indigo-500/40 text-left transition-all group cursor-pointer shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white tracking-tight mb-1">
                  Receive Files
                </h4>
                <p className="text-xs text-zinc-400">
                  Scan a QR code from another device or enter a 6-digit code to pair and receive files.
                </p>
              </button>
            </div>
          )}

          {/* Central File Drop Zone */}
          <FileDropZone onFilesSelected={handleFilesChosen} />

          {/* Outgoing File List */}
          {outgoingFiles.length > 0 && (
            <FileList
              files={outgoingFiles}
              onRemove={removeOutgoingFile}
              onClear={clearOutgoingFiles}
              onSend={startSending}
              isSending={isTransferring}
              disabled={status !== 'connected' || !isDataChannelReady}
              targetDeviceName={connectedPeer?.deviceName}
            />
          )}

          {/* Notice when files selected but not yet paired */}
          {outgoingFiles.length > 0 && status !== 'connected' && (
            <div className="p-4 rounded-2xl bg-[#171b26] border border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Pair with your receiver device to start sending selected files.</span>
              </div>
              <button
                onClick={handleStartShareClick}
                className="px-3 py-1.5 rounded-xl bg-amber-400 text-zinc-950 font-semibold text-xs hover:bg-amber-300 transition-colors cursor-pointer shrink-0"
              >
                Connect Device
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pairing Modal */}
      <PairingModal
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
        code={roomId || '000000'}
        onOpenScanner={() => {
          setIsPairingModalOpen(false)
          handleOpenScanner('scan')
        }}
        onManualCode={() => {
          setIsPairingModalOpen(false)
          handleOpenScanner('code')
        }}
      />

      {/* QR Scanner / Manual Code Modal */}
      <QRScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onCodeScanned={(code) => {
          onJoinSession(code)
          showToast(`Connecting with code ${code}...`, 'info')
        }}
        initialTab={scannerInitialTab}
      />
    </div>
  )
}
