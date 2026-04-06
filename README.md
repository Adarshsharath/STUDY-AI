# AnswerXtractor 📄🤖

> **AI-powered document Q&A app** — Upload a PDF, DOCX, PPTX, or TXT file and ask questions about it. Powered by Groq (Llama 3.3 70B).

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Getting a Groq API Key](#getting-a-groq-api-key)
5. [Installation on Windows](#installation-on-windows)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
6. [Running the Application](#running-the-application)
7. [First Time Usage](#first-time-usage)
8. [Project Structure](#project-structure)
9. [Environment Variables](#environment-variables)
10. [Troubleshooting](#troubleshooting)
11. [Known Issues & Fixes](#known-issues--fixes)

---

## Project Overview

AnswerXtractor lets you upload documents and ask natural language questions. The backend extracts text from your files, sends it to Groq's LLM API along with your question, and returns a grounded answer — no hallucination, only content from your document.

**Supported file types:** PDF, DOCX, PPTX, TXT  
**Max file size:** 16 MB

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React + Vite + Tailwind CSS       |
| Backend    | Flask + SQLAlchemy + SQLite       |
| AI Model   | Groq API (Llama 3.3 70B)          |
| Auth       | JWT (JSON Web Tokens)             |
| Doc Parse  | pdfplumber, python-docx, python-pptx |

---

## Prerequisites

Install all of the following before starting:

### 1. Python 3.10 or later
- Download from: https://www.python.org/downloads/
- ✅ During installation, check **"Add Python to PATH"**
- Verify: open Command Prompt and run:
  ```
  python --version
  ```

### 2. Node.js (v18 or later) + npm
- Download from: https://nodejs.org/en/download
- Choose the **LTS** version
- Verify:
  ```
  node --version
  npm --version
  ```

### 3. Git (optional, for cloning)
- Download from: https://git-scm.com/download/win

---

## Getting a Groq API Key

The backend requires a **free** Groq API key to use the AI model.

1. Go to https://console.groq.com
2. Sign up or log in with Google/GitHub
3. Navigate to **API Keys** in the left sidebar
4. Click **Create API Key**, give it a name
5. **Copy the key** — you won't see it again!
6. Save it for the `.env` setup step below

---

## Installation on Windows

> ⚠️ All commands below are for **Windows Command Prompt** or **PowerShell**.  
> If you're using WSL (Linux on Windows), replace `python` with `python3` and `venv\Scripts\activate` with `source venv/bin/activate`.

### Backend Setup

Open Command Prompt and navigate to the project backend:

```cmd
cd path\to\STUDY-AI\backend
```

**Step 1 — Create a virtual environment:**
```cmd
python -m venv venv
```

**Step 2 — Activate the virtual environment:**
```cmd
venv\Scripts\activate
```
You should see `(venv)` appear at the start of your prompt.

**Step 3 — Install dependencies:**
```cmd
pip install -r requirements.txt
```

**Step 4 — Create the `.env` file:**

Create a file named `.env` inside the `backend/` folder with this content:
```
SECRET_KEY=change-this-to-any-random-string
GROQ_API_KEY=your-groq-api-key-here
```

Replace `your-groq-api-key-here` with the key you got from console.groq.com.

> 💡 `SECRET_KEY` can be anything — it's used to sign JWT tokens. Example: `SECRET_KEY=abc123xyz-my-app-secret`

---

### Frontend Setup

Open a **new** Command Prompt window and navigate to the frontend:

```cmd
cd path\to\STUDY-AI\frontend
```

**Step 1 — Install dependencies:**
```cmd
npm install
```

This will create a `node_modules` folder. It may take a minute.

---

## Running the Application

You need **two terminal windows** running simultaneously.

### Terminal 1 — Start the Backend

```cmd
cd path\to\STUDY-AI\backend
venv\Scripts\activate
python app.py
```

You should see output like:
```
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

### Terminal 2 — Start the Frontend

```cmd
cd path\to\STUDY-AI\frontend
npm run dev
```

You should see:
```
  VITE vX.X.X  ready in XXX ms
  ➜  Local:   http://localhost:3000/
```

### Open the App

Open your browser and go to:
```
http://localhost:3000
```

---

## First Time Usage

1. **Register** — Click "Sign up" and create an account (stored locally in SQLite)
2. **Login** — Use your credentials
3. **Upload a Document** — Go to Documents → Upload (PDF/DOCX/PPTX/TXT, max 16MB)
4. **Ask Questions** — Click "New Chat" → Select your document → Start asking!

### Sample Questions

If you upload a research paper:
- "What is the main argument of this paper?"
- "Summarize the methodology section"
- "What were the key findings?"

If you upload a resume:
- "What is the candidate's work experience?"
- "List all the skills mentioned"

---

## Project Structure

```
STUDY-AI/
├── backend/
│   ├── app.py                 # Flask app, all API routes
│   ├── models.py              # SQLAlchemy DB models (User, Document, Chat)
│   ├── document_extractor.py  # Text extraction from PDF/DOCX/PPTX/TXT
│   ├── groq_service.py        # Groq API integration
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # ⚠️ Secret keys (DO NOT commit to git)
│   └── venv/                  # Python virtual environment (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page-level components (Login, Chat, etc.)
│   │   ├── context/           # Auth context (JWT management)
│   │   ├── App.jsx            # Root component, routing
│   │   └── main.jsx           # Entry point
│   ├── package.json           # Node.js dependencies
│   └── vite.config.js         # Vite dev server config
│
├── README.md                  # This file
├── SETUP.md                   # Quick setup reference
├── API_DOCUMENTATION.md       # API endpoint reference
└── DEPLOYMENT.md              # Production deployment guide
```

---

## Environment Variables

The `backend/.env` file must contain:

| Variable       | Description                              | Example                          |
|----------------|------------------------------------------|----------------------------------|
| `SECRET_KEY`   | JWT signing secret (any string)          | `my-super-secret-key-123`        |
| `GROQ_API_KEY` | API key from console.groq.com            | `gsk_abc123...`                  |

---

## Troubleshooting

### `python` is not recognized
- Make sure Python is installed and added to PATH
- Try `py` instead of `python`
- Re-install Python and check "Add to PATH" during setup

### `venv\Scripts\activate` fails in PowerShell
Run this once to allow script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Backend error: `GROQ_API_KEY not set`
- Make sure `backend/.env` exists and contains your API key
- The file must be named exactly `.env` (no `.txt` extension)

### Backend error: `TypeError: proxies` / `GroqError`
This is a package version conflict. Fix it:
```cmd
pip install --upgrade groq
```

### Frontend won't start / blank page
```cmd
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```

### Database errors on startup
Delete the auto-generated database and restart:
```cmd
cd backend
del answerxtractor.db
python app.py
```

### Port already in use
- Backend default port: **5000**
- Frontend default port: **3000**

Find and kill the process using the port:
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

---

## Known Issues & Fixes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `groq.GroqError: api_key must be set` | Missing `.env` file | Create `backend/.env` with your API key |
| `TypeError: Client.__init__() got unexpected keyword argument 'proxies'` | `groq==0.4.2` incompatible with newer `httpx` | `pip install --upgrade groq` |
| Slow `npm install` on WSL | Node modules on Windows drive (`/mnt/d/`) | Move project to WSL home directory (`~/`) |
| `venv\Scripts\activate` fails | PowerShell execution policy | Run `Set-ExecutionPolicy RemoteSigned` |

---

## API Reference

Full API documentation is available in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).

Key endpoints:
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login, returns JWT token
- `POST /api/documents/upload` — Upload a document
- `GET /api/documents` — List all documents
- `POST /api/chat` — Ask a question about a document
- `GET /api/chat/history` — Retrieve chat history

---

## Production Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for instructions on deploying to a server using Gunicorn (backend) and a static host (frontend).

---

*Happy coding! 🚀*
