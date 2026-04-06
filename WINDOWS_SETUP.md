# AnswerXtractor — Windows Setup Guide

Complete step-by-step instructions to get the app running on Windows from scratch.

---

## Step 1 — Install Python

1. Download Python 3.12 from https://www.python.org/downloads/
2. Run the installer
3. ✅ **Check "Add Python to PATH"** before clicking Install
4. Verify in Command Prompt:

```cmd
python --version
pip --version
```

---

## Step 2 — Install Node.js

1. Download Node.js LTS from https://nodejs.org/en/download
2. Run the installer (leave all defaults)
3. Verify:

```cmd
node --version
npm --version
```

---

## Step 3 — Get a Groq API Key (Free)

1. Go to https://console.groq.com
2. Sign up / Log in
3. Click **API Keys** → **Create API Key**
4. Copy the key — you'll need it in Step 5

---

## Step 4 — Backend Setup

Open **Command Prompt** and run these commands one by one:

```cmd
cd path\to\STUDY-AI\backend
```

> Replace `path\to\STUDY-AI` with the actual folder location, e.g. `cd D:\STUDY-AI\backend`

```cmd
python -m venv venv
```

```cmd
venv\Scripts\activate
```

> You should see `(venv)` at the start of the prompt

```cmd
pip install -r requirements.txt
```

---

## Step 5 — Create the `.env` File

Inside the `backend\` folder, create a file named `.env` (no `.txt` extension) with this content:

```
SECRET_KEY=any-random-string-here
GROQ_API_KEY=paste-your-groq-api-key-here
```

**How to create it via Command Prompt** (while inside `backend\`):

```cmd
echo SECRET_KEY=my-secret-key-123 > .env
echo GROQ_API_KEY=paste-your-key-here >> .env
```

Or just create it manually in Notepad — save it as `.env` (choose "All Files" in the save dialog so it doesn't add `.txt`).

---

## Step 6 — Frontend Setup

Open a **new** Command Prompt window:

```cmd
cd path\to\STUDY-AI\frontend
```

```cmd
npm install
```

---

## Step 7 — Run the Application

You need **two Command Prompt windows** open at the same time.

### Terminal 1 — Backend

```cmd
cd path\to\STUDY-AI\backend
venv\Scripts\activate
python app.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
```

### Terminal 2 — Frontend

```cmd
cd path\to\STUDY-AI\frontend
npm run dev
```

Expected output:
```
  ➜  Local:   http://localhost:3000/
```

---

## Step 8 — Open the App

Open your browser and go to:

```
http://localhost:3000
```

Register an account → Upload a document → Start chatting!

---

## Troubleshooting

### PowerShell: `activate` script blocked
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### `groq` package error (`proxies` / `api_key`)
```cmd
pip install --upgrade groq
```

### Frontend broken after failed install
```cmd
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Database error on startup
```cmd
cd backend
del answerxtractor.db
python app.py
```

### Port already in use
```cmd
netstat -ano | findstr :5000
taskkill /PID <replace-with-pid> /F
```

---

## Quick Reference — All Commands

```cmd
REM === BACKEND (run once) ===
cd D:\STUDY-AI\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
REM Create .env file manually with SECRET_KEY and GROQ_API_KEY

REM === FRONTEND (run once) ===
cd D:\STUDY-AI\frontend
npm install

REM === START BACKEND (every time) ===
cd D:\STUDY-AI\backend
venv\Scripts\activate
python app.py

REM === START FRONTEND (every time, new terminal) ===
cd D:\STUDY-AI\frontend
npm run dev
```
