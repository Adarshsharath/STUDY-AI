import React, { useState } from 'react'
import axios from 'axios'
import { Upload, FileText, Trash2, Calendar, CheckCircle, AlertCircle, X } from 'lucide-react'

const DocumentManager = ({ documents, onDocumentUploaded, onDeleteDocument, onSelectDocument }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [error, setError] = useState(null)

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain']

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|pptx|txt)$/i)) {
      setError('Only PDF, DOCX, PPTX, and TXT files are supported')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress({ filename: file.name, status: 'uploading' })

    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setUploadProgress({ filename: file.name, status: 'success' })
      onDocumentUploaded()

      setTimeout(() => {
        setUploadProgress(null)
      }, 3000)
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading document')
      setUploadProgress({ filename: file.name, status: 'error' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    return <FileText className="w-5 h-5" />
  }

  return (
    <div className="h-full bg-gray-950 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-gray-400">Upload and manage your documents</p>
        </div>

        {/* Upload Section */}
        <div className="glass-morphism rounded-2xl p-8 mb-8">
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-12 cursor-pointer transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500/50 hover:bg-white/5'
              }`}
          >
            <Upload className="w-12 h-12 text-primary-400 mb-4" />
            <p className="text-lg font-medium text-white mb-2">
              {uploading ? 'Uploading...' : 'Click to upload document'}
            </p>
            <p className="text-sm text-gray-400">
              Supports PDF, DOCX, PPTX, TXT (Max 16MB)
            </p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.docx,.pptx,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className={`mt-4 p-4 rounded-xl flex items-center justify-between ${uploadProgress.status === 'success' ? 'bg-green-500/10 border border-green-500/50' :
                uploadProgress.status === 'error' ? 'bg-red-500/10 border border-red-500/50' :
                  'bg-blue-500/10 border border-blue-500/50'
              }`}>
              <div className="flex items-center space-x-3">
                {uploadProgress.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : uploadProgress.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                )}
                <span className={`text-sm ${uploadProgress.status === 'success' ? 'text-green-400' :
                    uploadProgress.status === 'error' ? 'text-red-400' :
                      'text-blue-400'
                  }`}>
                  {uploadProgress.status === 'success' ? 'Uploaded successfully: ' :
                    uploadProgress.status === 'error' ? 'Upload failed: ' :
                      'Uploading: '}
                  {uploadProgress.filename}
                </span>
              </div>
              {uploadProgress.status !== 'uploading' && (
                <button
                  onClick={() => setUploadProgress(null)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          )}
        </div>

        {/* Documents Grid */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Your Documents ({documents.length})
          </h2>

          {documents.length === 0 ? (
            <div className="glass-morphism rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="glass-morphism rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => onSelectDocument(doc)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                      {getFileIcon(doc.filename)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this document?')) {
                          onDeleteDocument(doc.id)
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>

                  <h3 className="font-medium text-white mb-2 truncate" title={doc.filename}>
                    {doc.filename}
                  </h3>

                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(doc.uploaded_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentManager
