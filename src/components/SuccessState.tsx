import React, { useEffect } from 'react'
import type { TransferFileItem } from '../types/transfer'
import { formatBytes } from '../utils/formatting'
import confetti from 'canvas-confetti'
import {
  CheckCircle2,
  Download,
  Archive,
  RefreshCw,
  PlusCircle,
  File,
  Image as ImageIcon,
  Video,
  FileText
} from 'lucide-react'

interface SuccessStateProps {
  role: 'sender' | 'receiver'
  peerName: string
  files: TransferFileItem[]
  onSendMore: () => void
  onNewConnection: () => void
  onDownloadSingle?: (blobUrl: string, fileName: string) => void
  onDownloadAllAsZip?: () => void
  isZipping?: boolean
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  role,
  peerName,
  files,
  onSendMore,
  onNewConnection,
  onDownloadSingle,
  onDownloadAllAsZip,
  isZipping = false
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#38bdf8', '#818cf8', '#34d399']
      })
    } catch {}
  }, [])

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0)

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-sky-400" />
    if (type.startsWith('video/')) return <Video className="w-4 h-4 text-indigo-400" />
    if (type.includes('pdf') || type.includes('text/')) return <FileText className="w-4 h-4 text-emerald-400" />
    return <File className="w-4 h-4 text-zinc-400" />
  }

  return (
    <div className="w-full bg-[#12141c] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-center">
      {/* Icon & Title */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight">Transfer Complete</h3>
        <p className="text-sm text-zinc-400 mt-1 max-w-sm">
          {role === 'sender'
            ? `Successfully sent ${files.length} ${files.length === 1 ? 'file' : 'files'} to ${peerName}.`
            : `Successfully received ${files.length} ${files.length === 1 ? 'file' : 'files'} from ${peerName}.`}
        </p>
        <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#1a1d28] border border-white/[0.06] text-xs font-mono text-zinc-300">
          Total: {formatBytes(totalBytes)}
        </span>
      </div>

      {/* Receiver Download Section */}
      {role === 'receiver' && (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Files Ready for Download
            </h4>

            {files.length > 1 && onDownloadAllAsZip && (
              <button
                onClick={onDownloadAllAsZip}
                disabled={isZipping}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:text-sky-300 text-xs font-medium transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{isZipping ? 'Preparing ZIP...' : 'Download All as ZIP'}</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#171b26] border border-white/[0.04] hover:border-white/[0.08] transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-white/[0.05]">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-200 truncate">{file.name}</p>
                    <p className="text-[10px] text-zinc-500">{formatBytes(file.size)}</p>
                  </div>
                </div>

                {file.blobUrl && onDownloadSingle && (
                  <button
                    onClick={() => onDownloadSingle(file.blobUrl!, file.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-white/[0.06]">
        <button
          onClick={onSendMore}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm shadow-lg shadow-sky-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Send More Files</span>
        </button>

        <button
          onClick={onNewConnection}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1d28] hover:bg-[#232736] border border-white/[0.08] text-zinc-300 hover:text-white font-medium text-sm transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>New Connection</span>
        </button>
      </div>
    </div>
  )
}
