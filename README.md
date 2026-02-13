# AnswerXtractor – An AI That Reads For You

A production-ready AI web application that allows users to upload documents and ask questions based on the document content using Groq's LLM API.

## 🌟 Features

- **Authentication**: Secure user registration and login with JWT tokens
- **Document Upload**: Support for PDF, DOCX, PPTX, and TXT files
- **Intelligent Text Extraction**: Automatic text extraction from uploaded documents
- **Context-Aware AI Chat**: Ask questions and get accurate answers based on document content
- **No Hallucination**: AI strictly answers based on provided document context
- **Chat History**: Persistent chat sessions with full conversation history
- **Beautiful UI**: Dark theme with glassmorphism design inspired by modern AI interfaces
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Styling and design system
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **React Router** - Navigation
- **Lucide React** - Icon library

### Backend
- **Python Flask** - Web framework
- **SQLite** - Database
- **SQLAlchemy** - ORM
- **JWT** - Authentication
- **Groq API** - LLM integration
- **pdfplumber** - PDF text extraction
- **python-docx** - DOCX text extraction
- **python-pptx** - PPTX text extraction

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Groq API Key** (Get it from [Groq Console](https://console.groq.com))

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd answerxtractor
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env file and add your credentials:
# SECRET_KEY=your-secret-key-here
# GROQ_API_KEY=your-groq-api-key-here
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

## 🎯 Running the Application

### Start Backend Server

```bash
# From backend directory with activated virtual environment
python app.py
```

Backend will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
# From frontend directory
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📖 Usage Guide

### 1. Register an Account
- Navigate to `http://localhost:3000/register`
- Enter your email and password
- Click "Create Account"

### 2. Login
- Navigate to `http://localhost:3000/login`
- Enter your credentials
- Click "Sign In"

### 3. Upload a Document
- Click "Documents" in the sidebar
- Click the upload area or drag and drop a file
- Supported formats: PDF, DOCX, PPTX, TXT
- Wait for the upload to complete

### 4. Start a Chat
- Click "New Chat" button
- Select a document (or it will auto-select if you have one)
- Start asking questions about your document

### 5. Ask Questions
- Type your question in the input field
- Press Enter or click the send button
- The AI will respond based on the document content
- If the answer isn't in the document, you'll get: "Not found in the document."

### 6. View Chat History
- All your chats are saved in the sidebar
- Click on any previous chat to continue the conversation
- Delete chats using the trash icon

## 🗄️ Database Schema

### Users Table
```sql
- id (Primary Key)
- email (Unique)
- password_hash
- created_at
```

### Documents Table
```sql
- id (Primary Key)
- user_id (Foreign Key → Users)
- filename
- extracted_text
- uploaded_at
```

### Chats Table
```sql
- id (Primary Key)
- user_id (Foreign Key → Users)
- document_id (Foreign Key → Documents)
- created_at
```

### Messages Table
```sql
- id (Primary Key)
- chat_id (Foreign Key → Chats)
- sender (user/ai)
- message
- timestamp
```

## 🔐 Security Features

- Password hashing using Werkzeug
- JWT token-based authentication
- Protected API routes
- CORS configuration
- Secure file upload validation
- SQL injection prevention via SQLAlchemy ORM

## 🎨 UI Features

- **Glassmorphism Design**: Modern frosted glass effect
- **Dark Theme**: Easy on the eyes
- **Responsive Layout**: Mobile-friendly design
- **Smooth Animations**: Fade-in effects and transitions
- **Loading States**: Clear feedback for async operations
- **Error Handling**: User-friendly error messages

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Documents
- `GET /api/documents` - Get user's documents
- `POST /api/documents/upload` - Upload new document
- `DELETE /api/documents/<id>` - Delete document

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/<id>` - Get chat messages
- `POST /api/chats/<id>/messages` - Send message
- `DELETE /api/chats/<id>` - Delete chat

### Health Check
- `GET /api/health` - Check API status

## 🤖 AI Behavior

The system uses a strict prompt to prevent hallucination:

```
Answer ONLY using the provided document context.
If the answer is not present in the document, respond with:
"Not found in the document."
```

Model: **Llama 3.3 70B Versatile** (via Groq)
- Temperature: 0.1 (for deterministic responses)
- Max Tokens: 1024
- Top P: 0.9

## 🐛 Troubleshooting

### Backend Issues

**Database not created:**
```bash
python
>>> from app import app, db
>>> with app.app_context():
>>>     db.create_all()
```

**Import errors:**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

### Frontend Issues

**Dependencies not installing:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**
```bash
npm run build
```

### Common Errors

**CORS errors:**
- Check that backend is running on port 5000
- Verify CORS configuration in `app.py`

**File upload fails:**
- Check file size (max 16MB)
- Verify file type is supported
- Check backend logs for extraction errors

## 📦 Production Deployment

### Backend (Gunicorn + Nginx)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend (Build for Production)

```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Environment Variables

Production `.env`:
```
SECRET_KEY=<strong-random-key>
GROQ_API_KEY=<your-groq-api-key>
DATABASE_URL=<production-database-url>
```

## 🤝 Contributing

This is a demo/hackathon project. Feel free to fork and customize!

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 🙏 Credits

- **UI Inspiration**: [Weave AI Healthcare Automation](https://dribbble.com/shots/27082338-Weave-AI-Healthcare-Automation)
- **LLM Provider**: [Groq](https://groq.com)
- **Icons**: [Lucide](https://lucide.dev)

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ by Antigravity
