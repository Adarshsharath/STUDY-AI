import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  MessageSquarePlus,
  FileText,
  History,
  LogOut,
  Sparkles,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react'

const Sidebar = ({ documents, chats, currentChat, onNewChat, onSelectChat, onDeleteChat }) => {
  const { logout } = useAuth()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(!document.body.classList.contains('light'))

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    if (newDarkMode) {
      document.body.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
      document.body.classList.add('light')
      setIsDarkMode(false)
    }
  }, [])

  const handleNewChatClick = () => {
    if (documents.length === 0) {
      // Redirect to documents page
      return
    }

    if (documents.length === 1) {
      onNewChat(documents[0].id)
    } else {
      setSelectedDocument(documents[0].id)
      onNewChat(documents[0].id)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-80'} bg-gray-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white">AnswerXtractor</h2>
                <p className="text-xs text-gray-400">AI Document Assistant</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={handleNewChatClick}
          className="w-full bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/25"
          title="New Chat"
        >
          <MessageSquarePlus className="w-5 h-5" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Navigation */}
      {!isCollapsed && (
        <nav className="px-4 space-y-2">
          <Link
            to="/dashboard/documents"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/dashboard/documents'
              ? 'bg-white/10 text-white'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            <FileText className="w-5 h-5" />
            <span>Documents</span>
            <span className="ml-auto bg-white/10 px-2 py-1 rounded-lg text-xs">
              {documents.length}
            </span>
          </Link>
        </nav>
      )}

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!isCollapsed && (
          <>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
              Recent Chats
            </h3>
            <div className="space-y-2">
              {chats.length === 0 ? (
                <p className="text-gray-500 text-sm px-4 py-2">No chats yet</p>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative px-4 py-3 rounded-xl cursor-pointer transition-all hover-glow smooth-transition ${currentChat?.id === chat.id
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    onClick={() => onSelectChat(chat)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{chat.preview}</p>
                        <p className="text-xs text-gray-500 mt-1">{chat.document_name}</p>
                        <p className="text-xs text-gray-600 mt-1">{formatDate(chat.created_at)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteChat(chat.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Theme Toggle & Logout */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-xl transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!isCollapsed && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
