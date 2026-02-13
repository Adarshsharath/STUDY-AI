# AnswerXtractor - Deployment Guide

## Production Deployment Checklist

### 🔐 Security

- [ ] Change `SECRET_KEY` in backend `.env` to a strong random value
- [ ] Use production-grade database (PostgreSQL recommended)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domain
- [ ] Set secure cookie flags
- [ ] Rate limit API endpoints
- [ ] Input validation and sanitization

### 📦 Backend Deployment

#### Option 1: Gunicorn + Nginx (Recommended)

**Install Gunicorn:**
```bash
pip install gunicorn
```

**Run with Gunicorn:**
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /var/www/answerxtractor/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

#### Option 2: Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
    volumes:
      - ./data:/app/data

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### 🌐 Frontend Deployment

**Build for Production:**
```bash
cd frontend
npm run build
```

The `dist` folder contains production-ready files.

#### Deploy to Vercel:
```bash
npm install -g vercel
vercel --prod
```

#### Deploy to Netlify:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Deploy to AWS S3:
```bash
aws s3 sync dist/ s3://your-bucket-name
```

### 🗄️ Database Migration (SQLite → PostgreSQL)

**Install PostgreSQL dependencies:**
```bash
pip install psycopg2-binary
```

**Update app.py:**
```python
# Replace SQLite URI with PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'postgresql://user:password@localhost/answerxtractor'
)
```

**Migration script:**
```python
from app import app, db
with app.app_context():
    db.create_all()
```

### 🔧 Environment Variables (Production)

**Backend `.env`:**
```bash
SECRET_KEY=<use-strong-random-key-here>
GROQ_API_KEY=<your-groq-api-key>
DATABASE_URL=postgresql://user:password@host:5432/dbname
FLASK_ENV=production
```

**Generate Secret Key:**
```python
import secrets
print(secrets.token_urlsafe(32))
```

### 📊 Monitoring & Logging

**Add logging to app.py:**
```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

**Monitor with PM2:**
```bash
npm install -g pm2
pm2 start app.py --interpreter python3
pm2 startup
pm2 save
```

### 🚀 Platform-Specific Guides

#### Heroku Deployment

**Procfile:**
```
web: gunicorn app:app
```

**runtime.txt:**
```
python-3.11.0
```

**Deploy:**
```bash
heroku create answerxtractor
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku config:set GROQ_API_KEY=your-key
```

#### Railway Deployment

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Railway auto-detects and deploys

#### DigitalOcean App Platform

1. Create new app from GitHub
2. Configure build and run commands
3. Set environment variables
4. Deploy

### 🔍 Performance Optimization

**Backend:**
- Enable Gzip compression
- Use Redis for session storage
- Implement connection pooling
- Cache frequent database queries
- Use CDN for static assets

**Frontend:**
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization
- Service worker caching

### 🛡️ Security Best Practices

1. **Input Validation**: Sanitize all user inputs
2. **Rate Limiting**: Prevent API abuse
3. **File Upload**: Validate file types and sizes
4. **SQL Injection**: Use parameterized queries (already handled by SQLAlchemy)
5. **XSS Protection**: Sanitize HTML output
6. **CSRF Protection**: Implement CSRF tokens
7. **Secure Headers**: Add security headers

**Add Flask-Limiter:**
```bash
pip install flask-limiter
```

```python
from flask_limiter import Limiter
limiter = Limiter(app, key_func=lambda: request.headers.get('Authorization'))

@limiter.limit("5 per minute")
@app.route('/api/auth/login', methods=['POST'])
def login():
    # ...
```

### 📈 Scaling Considerations

**Horizontal Scaling:**
- Load balancer (Nginx, HAProxy)
- Multiple backend instances
- Shared database
- Redis for session management

**Vertical Scaling:**
- Increase server resources
- Optimize database queries
- Use connection pooling

### 🔄 CI/CD Pipeline

**GitHub Actions (.github/workflows/deploy.yml):**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Build Frontend
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy
        run: |
          # Your deployment commands here
```

### 📱 Mobile Considerations

The app is responsive, but for better mobile experience:
- Add PWA manifest
- Implement service worker
- Add touch gestures
- Optimize for mobile viewport

**manifest.json:**
```json
{
  "name": "AnswerXtractor",
  "short_name": "AnswerXtractor",
  "description": "An AI That Reads For You",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0ea5e9",
  "background_color": "#030712"
}
```

### ✅ Pre-Deployment Testing

- [ ] Test all authentication flows
- [ ] Test document upload for all file types
- [ ] Test chat functionality
- [ ] Test error handling
- [ ] Load testing with multiple users
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Security audit

### 📞 Post-Deployment

- Monitor error logs
- Set up alerts for downtime
- Configure backups
- Document API endpoints
- Set up analytics
- Create user documentation

---

**Need Help?**
- Check application logs
- Review error messages
- Test API endpoints with Postman
- Verify environment variables
- Check database connections
