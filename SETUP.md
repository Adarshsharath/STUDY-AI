# AnswerXtractor - Quick Setup Guide

## Step-by-Step Installation

### 1. Install Backend Dependencies

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create `backend/.env`:
```bash
SECRET_KEY=your-secret-key-change-this-in-production
GROQ_API_KEY=your-groq-api-key-here
```

**Get your Groq API Key:**
1. Visit https://console.groq.com
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy and paste into `.env` file

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
# Activate venv if not already activated
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## First Time Usage

1. **Register**: Click "Sign up" and create an account
2. **Login**: Use your credentials to log in
3. **Upload Document**: Click "Documents" → Upload a PDF/DOCX/PPTX/TXT file
4. **Start Chat**: Click "New Chat" → Ask questions about your document
5. **Enjoy**: Get accurate answers based on your document content!

## Testing the Application

### Sample Questions to Try:

If you upload a research paper:
- "What is the main topic of this document?"
- "Summarize the key findings"
- "What methodology was used?"

If you upload a resume:
- "What are the work experiences listed?"
- "What skills are mentioned?"
- "What is the education background?"

### Expected Behavior:

✅ **Correct**: Questions answered from document content
✅ **Correct**: "Not found in the document." for information not present
❌ **Incorrect**: AI making up information not in the document

## Troubleshooting

### Backend won't start:
```bash
# Make sure virtual environment is activated
# Windows:
cd backend
venv\Scripts\activate
python app.py

# Mac/Linux:
cd backend
source venv/bin/activate
python app.py
```

### Frontend won't start:
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database errors:
```bash
# Delete existing database and restart
cd backend
rm answerxtractor.db
python app.py
```

### File upload errors:
- Check file size (must be < 16MB)
- Verify file type (PDF, DOCX, PPTX, TXT only)
- Check backend console for error messages

## Production Deployment

### Backend (Example with Gunicorn):
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend (Build):
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your hosting service
```

## Architecture Overview

```
AnswerXtractor/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models.py              # Database models
│   ├── document_extractor.py  # Text extraction logic
│   ├── groq_service.py        # Groq API integration
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── context/           # Auth context
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json           # Node dependencies
│   └── vite.config.js         # Vite configuration
│
└── README.md                  # Documentation
```

## Key Technologies

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Flask + SQLAlchemy + SQLite
- **AI**: Groq API (Llama 3.3 70B)
- **Auth**: JWT tokens
- **Document Processing**: pdfplumber, python-docx, python-pptx

## Support

If you encounter issues:
1. Check the console/terminal for error messages
2. Verify all dependencies are installed
3. Ensure `.env` file has valid API keys
4. Check that both backend (port 5000) and frontend (port 3000) are running

Happy coding! 🚀
