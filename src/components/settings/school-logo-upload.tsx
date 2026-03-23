'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, ImageIcon, CheckCircle2, XCircle, School } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { uploadSchoolLogoAction, deleteSchoolLogoAction } from '@/lib/actions/school-logo'

interface SchoolLogoUploadProps {
  schoolId: number
  currentLogo?: string | null
  schoolName?: string
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 5

export default function SchoolLogoUpload({ schoolId, currentLogo, schoolName }: SchoolLogoUploadProps) {
  const { setUserLogo } = useAuthStore()
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      showMessage('error', 'Only JPG, PNG, WebP, or GIF allowed')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showMessage('error', `File too large. Max ${MAX_SIZE_MB}MB allowed`)
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string)
      setSelectedFile(file)
    }
    reader.readAsDataURL(file)
  }

  async function handleUpload() {
    if (!selectedFile) return

    setUploading(true)
    setMessage(null)

    const result = await uploadSchoolLogoAction(schoolId, selectedFile)

    if (result.success) {
      setUserLogo(result.logo_url)
      setPreview(null)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      showMessage('success', 'Logo updated successfully')
    } else {
      showMessage('error', result.error || 'Upload failed')
    }

    setUploading(false)
  }

  async function handleDelete() {
    if (!currentLogo) return
    if (!confirm('Remove school logo?')) return

    setDeleting(true)
    setMessage(null)

    const result = await deleteSchoolLogoAction(schoolId, currentLogo)

    if (result.success) {
      setUserLogo(undefined)
      showMessage('success', 'Logo removed')
    } else {
      showMessage('error', result.error || 'Delete failed')
    }

    setDeleting(false)
  }

  const displayLogo = preview || currentLogo

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <School className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">School Logo</h3>
      </div>

      {/* Current / Preview Logo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center border-2 border-zinc-700">
            {displayLogo ? (
              <img
                src={displayLogo}
                alt="School logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-zinc-600" />
              </div>
            )}
          </div>
          {preview && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {preview ? (
            <div>
              <p className="text-xs text-green-400 font-medium">New logo preview</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{selectedFile?.name}</p>
            </div>
          ) : currentLogo ? (
            <div>
              <p className="text-xs text-zinc-400">Current logo</p>
              <p className="text-[10px] text-zinc-600 mt-0.5 truncate">{currentLogo}</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-zinc-400">No logo set</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Recommended: square image, max 5MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <Upload className="w-3 h-3" />
          {preview ? 'Change' : 'Upload'}
        </button>

        {preview && (
          <>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {uploading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setPreview(null)
                setSelectedFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}

        {currentLogo && !preview && (
          <button
            onClick={handleDelete}
            disabled={deleting || uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg border border-red-500/20 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
            {deleting ? 'Removing...' : 'Remove'}
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
          message.type === 'success'
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}
    </div>
  )
}
