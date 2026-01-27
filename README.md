# AI Support Desk + Smart Analytics (Zendesk-style)

A full-stack portfolio project that lets users create support tickets, then **AI auto-triages** each ticket (category, sentiment, priority) and generates an **AI suggested reply**. Admins can view a real-time **analytics dashboard** with charts.

---

## 🌐 Live Demo

- **Frontend (Web App):** https://willowy-kashata-c8781a.netlify.app  
- **Backend (API Base):** https://ai-support-desk.onrender.com  
- **API Docs (Swagger):** https://ai-support-desk.onrender.com/api/docs/

> Note: Render Free can “sleep” when idle. First load may take ~30–60 seconds.

---

## ✨ Key Features

### Ticketing (User)
- Register/Login (JWT)
- Create tickets (title + description)
- View “My tickets”
- Ticket detail page with comments
- Export tickets to CSV (if enabled)

### AI Auto-Triage (Async)
- Auto-detects **Category** (e.g., Billing/Login/Other)
- Predicts **Sentiment** (positive/neutral/negative)
- Assigns **Priority** (low/medium/high)
- Generates **AI Suggested Reply**
- Runs in the background using **Celery + Redis** (non-blocking UI)

> If `OPENAI_API_KEY` is not set, the AI step falls back to a simple rule-based classifier.

### Admin Dashboard (Staff)
- Total tickets, avg resolution time, health
- Charts: tickets by category, status, sentiment
- Built for “support manager” style analytics

---

## 🧱 Tech Stack

**Backend**
- Python, Django, DRF
- JWT Auth
- PostgreSQL (local via Docker / production via Neon)
- Celery + Redis for async jobs
- drf-spectacular for Swagger/OpenAPI

**AI**
- OpenAI API integration (triage + suggested reply)

**Frontend**
- React (Vite)
- Tailwind CSS
- Recharts (charts)

**Dev Services**
- Docker Compose: Postgres + Redis

---

## 📁 Project Structure

```
ai-support-desk/
  backend/
    supportdesk/
    tickets/
    manage.py
  frontend/
    src/
    public/
  docker-compose.yml
  render.yaml
  netlify.toml (optional)
```

---

## ✅ Quick Start (Local Dev)

### 0) Prereqs
- Python **3.11+**
- Node **18+** (Node 20 recommended)
- Docker Desktop

#### macOS Docker PATH fix (only if docker command not found)
If you see: `zsh: command not found: docker`

Run:
```bash
echo 'export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
docker --version
```

---

## 1) Start Postgres + Redis
From project root:
```bash
docker compose up -d db redis
```

---

## 2) Backend (Django + Celery)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # mac/linux
# .venv\Scripts\activate    # windows powershell

pip install -r requirements.txt

cp .env.example .env        # One-time setup
```

### Edit `backend/.env`
Set at least:
- `SECRET_KEY=...`
- `DEBUG=1`
- (optional) `OPENAI_API_KEY=...`

Now run:
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Start Celery worker (new terminal)
```bash
cd backend
source .venv/bin/activate
celery -A supportdesk worker -l info
```

### Backend URLs
- Swagger UI: http://127.0.0.1:8000/api/docs/
- OpenAPI schema: http://127.0.0.1:8000/api/schema/

---

## 3) Frontend (React)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open:
- http://127.0.0.1:5173

> Make sure frontend points to backend:
- Local: `http://127.0.0.1:8000`
- Production: `https://ai-support-desk.onrender.com`

---

## 🧪 Demo Flow (Local or Live)

1. Register a new user and login
2. Create a ticket
3. Wait a few seconds → AI fields populate (refresh if needed)
4. Open ticket detail → view AI summary + suggested reply
5. Login as superuser/admin → view Admin Dashboard

---

## 🔐 Environment Variables (Backend)

Common:
- `SECRET_KEY` – Django secret
- `DEBUG` – `1` for local, `0` for production
- `DATABASE_URL` – production DB URL (Neon)
- `ALLOWED_HOSTS` – `ai-support-desk.onrender.com` (production)
- `CORS_ALLOWED_ORIGINS` – Netlify URL (production)
- `CSRF_TRUSTED_ORIGINS` – Netlify URL (production)

AI:
- `OPENAI_API_KEY` – if not set, fallback mode used
- `OPENAI_MODEL` – example: `gpt-5.2`

---

## 🚀 Deployment (Free)

**Database:** Neon (Postgres)  
**Backend:** Render (Django + Gunicorn)  
**Frontend:** Netlify (React build)

### Production URLs
- Frontend: https://willowy-kashata-c8781a.netlify.app  
- Backend: https://ai-support-desk.onrender.com  

> Make sure Render has:
- `CORS_ALLOWED_ORIGINS=https://willowy-kashata-c8781a.netlify.app`
- `CSRF_TRUSTED_ORIGINS=https://willowy-kashata-c8781a.netlify.app`

---

## 🛠 Troubleshooting

### Netlify shows “Page not found”
- Ensure SPA redirect is enabled (React Router)
- Add `_redirects` in `frontend/public/_redirects`:
  ```
  /* /index.html 200
  ```

### Render shows Not Found on `/`
That’s fine. Use:
- `/api/docs/` for Swagger

### Live login doesn’t work but local works
Local DB and Neon DB are different. Create users on live separately.

---
