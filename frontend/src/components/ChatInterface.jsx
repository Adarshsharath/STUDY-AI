import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Send, FileText, Sparkles, Loader2, Copy, Brain } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const ChatInterface = ({ chat, document, onNewChat, onOpenStudyLab }) => {
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

  const handleAskWithoutContext = async (userMessage) => {
    if (!chat || loading) return

    setLoading(true)
    try {
      const response = await axios.post(`/api/chats/${chat.id}/messages`, {
        message: userMessage,
        no_context: true
      })

      setMessages([...messages, response.data.ai_message])
    } catch (error) {
      console.error('Error getting general response:', error)
      alert('Error getting general response. Please try again.')
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
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="text-white font-bold leading-none">{document?.filename || 'Document'}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {document?.type && document?.size
                  ? `${document.type.toUpperCase()} • ${Math.round(document.size / 1024)} KB`
                  : 'Ask questions about this document'}
              </p>
            </div>
          </div>
          {document && (
            <button
              onClick={onOpenStudyLab}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600/20 to-blue-600/20 hover:from-primary-600/30 hover:to-blue-600/30 text-primary-400 border border-primary-500/30 rounded-xl transition-all font-medium group hover-glow smooth-transition"
            >
              <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Study Lab</span>
            </button>
          )}
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
              <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                <div
                  className={`relative ${message.sender === 'user'
                    ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white'
                    : 'glass-morphism text-gray-100'
                    } rounded-2xl px-6 py-4 shadow-xl fade-in`}
                >
                  <div className="markdown-content">
                    {message.sender === 'user' ? (
                      <p className="whitespace-pre-wrap">{message.message}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <div className="relative group">
                                <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-xs text-white backdrop-blur-sm border border-white/10"
                                    title="Copy code"
                                  >
                                    Copy
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={match[1]}
                                  PreTag="div"
                                  className="!m-0 !bg-gray-900/50 !p-4"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            )
                          }
                        }}
                      >
                        {message.message}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
                {message.sender === 'ai' && (
                  <button
                    onClick={() => {
                      const prevUserMsg = [...messages].reverse().find(m => m.sender === 'user' && m.timestamp <= message.timestamp);
                      if (prevUserMsg) handleAskWithoutContext(prevUserMsg.message);
                    }}
                    className="mt-2 text-[10px] flex items-center space-x-1 text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-widest font-bold px-2 py-1 rounded hover:bg-white/5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Ask AI without context</span>
                  </button>
                )}
                <div className="flex items-center space-x-2 mt-2 px-2">
                  <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                    {message.sender === 'user' ? 'You' : 'AnswerXtractor'}
                  </span>
                  <span className="text-[10px] text-gray-600">•</span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
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
