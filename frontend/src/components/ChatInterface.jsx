import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Send, FileText, Sparkles, Loader2 } from 'lucide-react'

const ChatInterface = ({ chat, document, onNewChat }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (chat) {
      loadMessages()
    } else {
      setMessages([])
    }
  }, [chat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    if (!chat) return
    
    setLoadingMessages(true)
    try {
      const response = await axios.get(`/api/chats/${chat.id}`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || !chat) return

    setLoading(true)
    const userMessage = inputMessage
    setInputMessage('')

    try {
      const response = await axios.post(`/api/chats/${chat.id}/messages`, {
        message: userMessage
      })

      setMessages([...messages, response.data.user_message, response.data.ai_message])
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Welcome to AnswerXtractor
          </h2>
          <p className="text-gray-400 mb-6">
            Upload a document and start a new chat to ask questions based on your document content.
          </p>
          <button
            onClick={() => onNewChat(null)}
            className="bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25"
          >
            Get Started
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="border-b border-white/5 bg-gray-900/50 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">{document?.filename || 'Document'}</h2>
              <p className="text-sm text-gray-400">Ask questions about this document</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                Start by asking a question about the document
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-primary-500 to-blue-600 text-white'
                    : 'glass-morphism text-gray-100'
                } rounded-2xl px-6 py-4 shadow-lg fade-in`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
                <p className="text-xs mt-2 opacity-60">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="glass-morphism rounded-2xl px-6 py-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/5 bg-gray-900/50 backdrop-blur-xl p-6">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                placeholder="Ask a question about the document..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all resize-none"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '200px' }}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white p-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  )
}

export default ChatInterface
