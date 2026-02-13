#!/bin/bash

# AnswerXtractor Backend Startup Script

echo "🚀 Starting AnswerXtractor Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/installed" ]; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
    touch venv/installed
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Creating .env from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your GROQ_API_KEY!"
    exit 1
fi

# Start the Flask application
echo "✅ Starting Flask server on http://localhost:5000"
python app.py
