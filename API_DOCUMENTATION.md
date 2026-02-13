# AnswerXtractor API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

**Authentication Header:**
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully!"
}
```

**Error Responses:**
- `400 Bad Request`: Missing email or password
- `400 Bad Request`: User already exists

---

### Login User

**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing credentials
- `401 Unauthorized`: Invalid credentials

---

## 📄 Document Endpoints

### Get All Documents

**GET** `/documents`

Retrieve all documents for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "filename": "research_paper.pdf",
    "uploaded_at": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "filename": "resume.docx",
    "uploaded_at": "2024-01-14T15:20:00"
  }
]
```

---

### Upload Document

**POST** `/documents/upload`

Upload a new document (PDF, DOCX, PPTX, or TXT).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
file: <binary file data>
```

**Response (201 Created):**
```json
{
  "message": "Document uploaded successfully!",
  "document": {
    "id": 3,
    "filename": "presentation.pptx",
    "uploaded_at": "2024-01-16T09:00:00"
  }
}
```

**Error Responses:**
- `400 Bad Request`: No file provided
- `400 Bad Request`: File type not supported
- `400 Bad Request`: No text extracted from document
- `500 Internal Server Error`: Document processing error

**Supported File Types:**
- PDF (`.pdf`)
- Word Document (`.docx`)
- PowerPoint (`.pptx`)
- Text File (`.txt`)

**Max File Size:** 16MB

---

### Delete Document

**DELETE** `/documents/<document_id>`

Delete a specific document and all associated chats.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Document deleted successfully!"
}
```

**Error Responses:**
- `404 Not Found`: Document not found

---

## 💬 Chat Endpoints

### Get All Chats

**GET** `/chats`

Retrieve all chat sessions for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "document_id": 1,
    "document_name": "research_paper.pdf",
    "created_at": "2024-01-15T10:35:00",
    "preview": "What is the main topic of this research?"
  },
  {
    "id": 2,
    "document_id": 2,
    "document_name": "resume.docx",
    "created_at": "2024-01-14T15:25:00",
    "preview": "What are the work experiences?"
  }
]
```

---

### Create New Chat

**POST** `/chats`

Create a new chat session for a document.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "document_id": 1
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "document_id": 1,
  "created_at": "2024-01-16T09:05:00"
}
```

**Error Responses:**
- `400 Bad Request`: Document ID required
- `404 Not Found`: Document not found

---

### Get Chat Messages

**GET** `/chats/<chat_id>`

Retrieve all messages in a specific chat.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "sender": "user",
    "message": "What is the main topic?",
    "timestamp": "2024-01-15T10:36:00"
  },
  {
    "id": 2,
    "sender": "ai",
    "message": "The main topic of this document is machine learning algorithms.",
    "timestamp": "2024-01-15T10:36:05"
  }
]
```

**Error Responses:**
- `404 Not Found`: Chat not found

---

### Send Message

**POST** `/chats/<chat_id>/messages`

Send a message in a chat and receive AI response.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "What methodology was used in this research?"
}
```

**Response (201 Created):**
```json
{
  "user_message": {
    "id": 3,
    "sender": "user",
    "message": "What methodology was used in this research?",
    "timestamp": "2024-01-15T10:40:00"
  },
  "ai_message": {
    "id": 4,
    "sender": "ai",
    "message": "The research used a quantitative methodology with experimental design...",
    "timestamp": "2024-01-15T10:40:03"
  }
}
```

**Error Responses:**
- `404 Not Found`: Chat not found
- `404 Not Found`: Document not found
- `400 Bad Request`: Message required
- `500 Internal Server Error`: Error getting AI response

**AI Response Behavior:**
- Answers based ONLY on document content
- Returns "Not found in the document." if information isn't available
- Uses Groq's Llama 3.3 70B model
- Temperature: 0.1 (deterministic)
- Max tokens: 1024

---

### Delete Chat

**DELETE** `/chats/<chat_id>`

Delete a chat session and all its messages.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Chat deleted successfully!"
}
```

**Error Responses:**
- `404 Not Found`: Chat not found

---

## 🏥 Health Check

### Health Check

**GET** `/health`

Check if the API is running.

**Response (200 OK):**
```json
{
  "status": "healthy"
}
```

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider:
- Login attempts: 5 per minute
- Document uploads: 10 per hour
- Chat messages: 30 per minute

---

## Sample Usage with cURL

### Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Upload Document:
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf"
```

### Send Message:
```bash
curl -X POST http://localhost:5000/api/chats/1/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the main topic?"}'
```

---

## Sample Usage with JavaScript (Axios)

```javascript
import axios from 'axios';

// Set base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const token = response.data.token;
  
  // Set token for future requests
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  return response.data;
};

// Upload document
const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};

// Send message
const sendMessage = async (chatId, message) => {
  const response = await api.post(`/chats/${chatId}/messages`, { message });
  return response.data;
};
```

---

## WebSocket Support

Currently not implemented. For real-time features, consider adding Socket.IO:
- Real-time message delivery
- Typing indicators
- Live collaboration

---

## Versioning

Current Version: **v1.0.0**

Future versions will maintain backward compatibility.

---

**Questions or Issues?**
Please refer to the main README.md or open an issue on GitHub.
