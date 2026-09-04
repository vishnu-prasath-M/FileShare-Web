import React, { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { UploadCloud, FolderUp, FilePlus, HardDrive } from 'lucide-react'

interface FileDropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void
  disabled?: boolean
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFilesSelected, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files)
    }
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative group rounded-3xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center cursor-pointer ${
        isDragOver
          ? 'border-sky-400 bg-sky-500/[0.07] scale-[1.01]'
          : 'border-white/[0.12] hover:border-white/[0.22] bg-[#12141c]/70 hover:bg-[#12141c]'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={() => fileInputRef.current?.click()}
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Center Icon Badge */}
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200 ${
          isDragOver
            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
            : 'bg-[#1a1d28] text-sky-400 border border-white/[0.08]'
        }`}
      >
        <UploadCloud className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-semibold text-white tracking-tight mb-1">
        Choose files or drag & drop
      </h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6">
        Transfer photos, 4K videos, documents, or archives directly between devices with zero cloud uploads.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium shadow-lg shadow-sky-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <FilePlus className="w-4 h-4" />
          <span>Select Files</span>
        </button>

        <button
          type="button"
          onClick={() => folderInputRef.current?.click()}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1d28] hover:bg-[#232736] text-zinc-300 hover:text-white text-sm font-medium border border-white/[0.08] transition-all active:scale-95 cursor-pointer"
        >
          <FolderUp className="w-4 h-4" />
          <span>Select Folder</span>
        </button>
      </div>

      <div className="flex items-center gap-4 mt-6 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <HardDrive className="w-3.5 h-3.5" /> Any file type
        </span>
        <span>•</span>
        <span>Client-side chunked streaming</span>
      </div>
    </div>
  )
}
