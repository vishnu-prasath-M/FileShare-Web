import React from 'react'
import type { TransferFileItem } from '../types/transfer'
import { formatBytes, formatSpeed, formatTimeRemaining } from '../utils/formatting'
import {
  FileText,
  Image as ImageIcon,
  Video,
  File,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  X
} from 'lucide-react'

interface TransferProgressProps {
  role: 'sending' | 'receiving'
  peerName: string
  files: TransferFileItem[]
  overallPercent: number
  transferredBytes: number
  totalBytes: number
  speed: number
  eta: number
  onCancel: () => void
}

export const TransferProgress: React.FC<TransferProgressProps> = ({
  role,
  peerName,
  files,
  overallPercent,
  transferredBytes,
  totalBytes,
  speed,
  eta,
  onCancel
}) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-sky-400" />
    if (type.startsWith('video/')) return <Video className="w-4 h-4 text-indigo-400" />
    if (type.includes('pdf') || type.includes('text/')) return <FileText className="w-4 h-4 text-emerald-400" />
    return <File className="w-4 h-4 text-zinc-400" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Complete</span>
          </span>
        )
      case 'sending':
      case 'receiving':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            <span>{status === 'sending' ? 'Sending' : 'Receiving'}</span>
          </span>
        )
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </span>
        )
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Queued</span>
          </span>
        )
    }
  }

  return (
    <div className="w-full bg-[#12141c] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                role === 'sending' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {role === 'sending' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownLeft className="w-4 h-4" />
              )}
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {role === 'sending' ? `Sending to ${peerName}` : `Receiving from ${peerName}`}
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            {files.length} {files.length === 1 ? 'file' : 'files'} • {formatBytes(totalBytes)} total
          </p>
        </div>

        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel Transfer</span>
        </button>
      </div>

      {/* Main Overall Progress Dashboard */}
      <div className="bg-[#171b26] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block mb-0.5">
              Overall Progress
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {overallPercent}%
            </div>
          </div>

          <div className="text-right space-y-0.5">
            <div className="text-sm font-semibold text-zinc-200">
              {formatBytes(transferredBytes)} / {formatBytes(totalBytes)}
            </div>
            <div className="text-xs text-zinc-400 flex items-center justify-end gap-2 font-mono">
              <span className="text-sky-400 font-medium">{formatSpeed(speed)}</span>
              <span>•</span>
              <span>ETA {formatTimeRemaining(eta)}</span>
            </div>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-200"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Itemized List */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Transfer Queue
        </h4>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {files.map((file) => (
            <div
              key={file.id}
              className="p-3 rounded-xl bg-[#171b26] border border-white/[0.04] space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <span className="font-medium text-zinc-200 truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[11px] text-zinc-400">{formatBytes(file.size)}</span>
                  {getStatusBadge(file.status)}
                </div>
              </div>

              {/* Progress bar per item */}
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    file.status === 'completed'
                      ? 'bg-emerald-400'
                      : file.status === 'failed'
                      ? 'bg-rose-400'
                      : file.status === 'cancelled'
                      ? 'bg-zinc-600'
                      : 'bg-sky-400'
                  }`}
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
