import { useState, useEffect, useCallback, useRef } from 'react'
import { FileTransferEngine } from '../services/fileTransfer'
import type { TransferFileItem } from '../types/transfer'
import JSZip from 'jszip'

export function useFileTransfer(
  engine: FileTransferEngine | null,
  options?: { autoDownload?: boolean }
) {
  const [outgoingFiles, setOutgoingFiles] = useState<TransferFileItem[]>([])
  const [incomingFiles, setIncomingFiles] = useState<TransferFileItem[]>([])
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferRole, setTransferRole] = useState<'idle' | 'sending' | 'receiving'>('idle')
  const [overallSpeed, setOverallSpeed] = useState(0)
  const [overallEta, setOverallEta] = useState(0)
  const [isZipping, setIsZipping] = useState(false)

  const receivedBlobsRef = useRef<Map<string, Blob>>(new Map())

  // Attach engine listeners when engine becomes available
  useEffect(() => {
    if (!engine) return

    const unsubStart = engine.on('file-received-start', (item: any) => {
      const transferItem = item as TransferFileItem
      setIsTransferring(true)
      setTransferRole('receiving')
      setIncomingFiles((prev) => {
        const exists = prev.some((f) => f.id === transferItem.id)
        if (exists) return prev
        return [...prev, transferItem]
      })
    })

    const unsubProgress = engine.on('file-received-progress', (update: any) => {
      setOverallSpeed(update.speed || 0)
      setOverallEta(update.eta || 0)
      setIncomingFiles((prev) =>
        prev.map((f) =>
          f.id === update.fileId
            ? {
                ...f,
                progress: update.progress,
                transferredBytes: update.transferredBytes,
                speed: update.speed,
                eta: update.eta
              }
            : f
        )
      )
    })

    const unsubComplete = engine.on('file-received-complete', (item: any) => {
      const completedItem = item as TransferFileItem & { blob?: Blob }
      if (completedItem.blob) {
        receivedBlobsRef.current.set(completedItem.id, completedItem.blob)
      }

      setIncomingFiles((prev) =>
        prev.map((f) => (f.id === completedItem.id ? { ...f, ...completedItem, status: 'completed' } : f))
      )

      // Auto-download if enabled
      if (options?.autoDownload && completedItem.blobUrl) {
        downloadSingleFile(completedItem.blobUrl, completedItem.name)
      }

      // Check if all incoming are complete
      setTimeout(() => {
        setIncomingFiles((latest) => {
          const stillRunning = latest.some((f) => f.status === 'receiving' || f.status === 'waiting')
          if (!stillRunning) {
            setIsTransferring(false)
            setTransferRole('idle')
          }
          return latest
        })
      }, 500)
    })

    const unsubFailed = engine.on('file-received-failed', (data: any) => {
      setIncomingFiles((prev) =>
        prev.map((f) => (f.id === data.fileId ? { ...f, status: 'failed', error: data.error } : f))
      )
    })

    const unsubCancelled = engine.on('transfer-cancelled', (data: any) => {
      setIsTransferring(false)
      setTransferRole('idle')
      setIncomingFiles((prev) =>
        prev.map((f) =>
          !data.fileId || f.id === data.fileId
            ? { ...f, status: 'cancelled', error: data.reason || 'Cancelled' }
            : f
        )
      )
    })

    return () => {
      unsubStart()
      unsubProgress()
      unsubComplete()
      unsubFailed()
      unsubCancelled()
    }
  }, [engine, options?.autoDownload])

  // Add files to outgoing queue
  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newItems: TransferFileItem[] = fileArray.map((file) => {
      const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
      let previewUrl: string | undefined

      // Image thumbnail preview
      if (file.type.startsWith('image/')) {
        try {
          previewUrl = URL.createObjectURL(file)
        } catch {}
      }

      return {
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'waiting',
        progress: 0,
        transferredBytes: 0,
        speed: 0,
        eta: 0,
        previewUrl
      }
    })

    setOutgoingFiles((prev) => [...prev, ...newItems])
  }, [])

  const removeOutgoingFile = useCallback((id: string) => {
    setOutgoingFiles((prev) => {
      const item = prev.find((f) => f.id === id)
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl)
      }
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const clearOutgoingFiles = useCallback(() => {
    outgoingFiles.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
    })
    setOutgoingFiles([])
  }, [outgoingFiles])

  // Send selected files
  const startSending = useCallback(async () => {
    if (!engine || outgoingFiles.length === 0) return

    setIsTransferring(true)
    setTransferRole('sending')

    const rawFiles: File[] = []
    const fileMap = new Map<string, string>()

    outgoingFiles.forEach((item) => {
      if (item.file) {
        rawFiles.push(item.file)
        fileMap.set(item.file.name + '_' + item.file.size, item.id)
      }
    })

    for (const file of rawFiles) {
      const matchItem = outgoingFiles.find((f) => f.file === file)
      if (!matchItem) continue

      await engine.sendFile(file, (update) => {
        setOverallSpeed(update.speed || 0)
        setOverallEta(update.eta || 0)
        setOutgoingFiles((prev) =>
          prev.map((item) => (item.id === matchItem.id ? { ...item, ...update } : item))
        )
      })
    }

    setIsTransferring(false)
    setTransferRole('idle')
  }, [engine, outgoingFiles])

  const cancelTransfer = useCallback(() => {
    if (engine) {
      engine.cancelTransfer()
    }
    setIsTransferring(false)
    setTransferRole('idle')
    setOutgoingFiles((prev) =>
      prev.map((f) => (f.status === 'sending' ? { ...f, status: 'cancelled' } : f))
    )
  }, [engine])

  // Trigger browser download of single file
  const downloadSingleFile = useCallback((blobUrl: string, fileName: string) => {
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [])

  // Package all received files into a client-side ZIP archive
  const downloadAllAsZip = useCallback(async () => {
    if (incomingFiles.length === 0) return
    setIsZipping(true)

    try {
      const zip = new JSZip()
      for (const item of incomingFiles) {
        const blob = receivedBlobsRef.current.get(item.id)
        if (blob) {
          zip.file(item.name, blob)
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const zipUrl = URL.createObjectURL(zipBlob)
      downloadSingleFile(zipUrl, `DropLink-files-${new Date().toISOString().slice(0, 10)}.zip`)
      setTimeout(() => URL.revokeObjectURL(zipUrl), 10000)
    } catch (err) {
      console.error('Failed to create ZIP archive:', err)
    } finally {
      setIsZipping(false)
    }
  }, [incomingFiles, downloadSingleFile])

  // Total calculations
  const totalOutgoingBytes = outgoingFiles.reduce((acc, f) => acc + f.size, 0)
  const transferredOutgoingBytes = outgoingFiles.reduce((acc, f) => acc + f.transferredBytes, 0)
  const overallOutgoingPercent =
    totalOutgoingBytes > 0 ? Math.min(100, Math.round((transferredOutgoingBytes / totalOutgoingBytes) * 100)) : 0

  const totalIncomingBytes = incomingFiles.reduce((acc, f) => acc + f.size, 0)
  const transferredIncomingBytes = incomingFiles.reduce((acc, f) => acc + f.transferredBytes, 0)
  const overallIncomingPercent =
    totalIncomingBytes > 0 ? Math.min(100, Math.round((transferredIncomingBytes / totalIncomingBytes) * 100)) : 0

  return {
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
  }
}
