@echo off
REM AnswerXtractor Backend Startup Script for Windows

echo 🚀 Starting AnswerXtractor Backend...

REM Check if virtual environment exists
if not exist "venv\" (
    echo ❌ Virtual environment not found. Creating one...
    python -m venv venv
)

REM Activate virtual environment
echo 📦 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies if needed
if not exist "venv\installed" (
    echo 📥 Installing dependencies...
    pip install -r requirements.txt
    type nul > venv\installed
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found!
    echo 📝 Creating .env from example...
    copy .env.example .env
    echo ⚠️  Please edit .env and add your GROQ_API_KEY!
    pause
    exit
)

REM Start the Flask application
echo ✅ Starting Flask server on http://localhost:5000
python app.py
