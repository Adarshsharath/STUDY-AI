import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ChatInterface from '../components/ChatInterface'
import DocumentManager from '../components/DocumentManager'
import StudyTools from '../components/StudyTools'
import axios from 'axios'

const Dashboard = () => {
  const [documents, setDocuments] = useState([])
  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [currentDocument, setCurrentDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showStudyLab, setShowStudyLab] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadDocuments()
    loadChats()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await axios.get('/api/documents')
      setDocuments(response.data)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChats = async () => {
    try {
      const response = await axios.get('/api/chats')
      setChats(response.data)
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }

  const handleNewChat = async (documentId) => {
    if (!documentId) {
      // Show document selector if no document selected
      navigate('/dashboard/documents')
      return
    }

    try {
      const response = await axios.post('/api/chats', { document_id: documentId })
      const newChat = response.data
      setCurrentChat(newChat)
      setCurrentDocument(documents.find(d => d.id === documentId))
      await loadChats()
      navigate('/dashboard')
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const handleSelectChat = async (chat) => {
    setCurrentChat(chat)
    setCurrentDocument(documents.find(d => d.id === chat.document_id))
    navigate('/dashboard')
  }

  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(`/api/chats/${chatId}`)
      if (currentChat?.id === chatId) {
        setCurrentChat(null)
      }
      await loadChats()
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const handleDocumentUploaded = () => {
    loadDocuments()
  }

  const handleDeleteDocument = async (documentId) => {
    try {
      await axios.delete(`/api/documents/${documentId}`)
      if (currentDocument?.id === documentId) {
        setCurrentDocument(null)
        setCurrentChat(null)
      }
      await loadDocuments()
      await loadChats()
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        documents={documents}
        chats={chats}
        currentChat={currentChat}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={
              <ChatInterface
                chat={currentChat}
                document={currentDocument}
                onNewChat={handleNewChat}
                onOpenStudyLab={() => setShowStudyLab(true)}
              />
            }
          />
          <Route
            path="/documents"
            element={
              <DocumentManager
                documents={documents}
                onDocumentUploaded={handleDocumentUploaded}
                onDeleteDocument={handleDeleteDocument}
                onSelectDocument={(doc) => handleNewChat(doc.id)}
              />
            }
          />
        </Routes>
      </main>

      {showStudyLab && currentDocument && (
        <StudyTools
          document={currentDocument}
          onClose={() => setShowStudyLab(false)}
        />
      )}
    </div>
  )
}

export default Dashboard
