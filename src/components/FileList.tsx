import React from 'react'
import type { TransferFileItem } from '../types/transfer'
import { formatBytes } from '../utils/formatting'
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Code,
  File,
  X,
  Send,
  Trash2
} from 'lucide-react'

interface FileListProps {
  files: TransferFileItem[]
  onRemove: (id: string) => void
  onClear: () => void
  onSend: () => void
  isSending?: boolean
  disabled?: boolean
  targetDeviceName?: string
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemove,
  onClear,
  onSend,
  isSending = false,
  disabled = false,
  targetDeviceName
}) => {
  if (files.length === 0) return null

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0)

  const getFileIcon = (type: string, name: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-sky-400" />
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-indigo-400" />
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-purple-400" />
    if (type.includes('zip') || type.includes('tar') || type.includes('compressed'))
      return <Archive className="w-5 h-5 text-amber-400" />
    if (type.includes('pdf') || type.includes('document') || type.includes('text/'))
      return <FileText className="w-5 h-5 text-emerald-400" />
    if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.html') || name.endsWith('.json'))
      return <Code className="w-5 h-5 text-cyan-400" />
    return <File className="w-5 h-5 text-zinc-400" />
  }

  return (
    <div className="w-full bg-[#12141c] border border-white/[0.08] rounded-2xl p-5 shadow-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Selected Files</h4>
          <p className="text-xs text-zinc-400">
            {files.length} {files.length === 1 ? 'file' : 'files'} • Total {formatBytes(totalBytes)}
          </p>
        </div>

        {!isSending && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#171b26] border border-white/[0.04] hover:border-white/[0.08] transition-all"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Thumbnail or Icon */}
              {file.previewUrl ? (
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="w-10 h-10 rounded-lg object-cover bg-zinc-900 shrink-0 border border-white/[0.1]"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-white/[0.05]">
                  {getFileIcon(file.type, file.name)}
                </div>
              )}

              {/* Name and size */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-200 truncate">{file.name}</p>
                <p className="text-[11px] text-zinc-400">{formatBytes(file.size)}</p>
              </div>
            </div>

            {/* Remove Action */}
            {!isSending && (
              <button
                onClick={() => onRemove(file.id)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Send Button */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-end">
        <button
          onClick={onSend}
          disabled={disabled || isSending || files.length === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-white font-medium text-sm shadow-lg shadow-sky-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>
            {isSending
              ? 'Sending files...'
              : targetDeviceName
              ? `Send ${files.length} ${files.length === 1 ? 'file' : 'files'} to ${targetDeviceName}`
              : `Send ${files.length} ${files.length === 1 ? 'file' : 'files'}`}
          </span>
        </button>
      </div>
    </div>
  )
}
