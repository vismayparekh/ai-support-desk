# AI Support Desk + Smart Analytics (Zendesk-style)

A full-stack portfolio project using:
- Backend: Python, Django, DRF, JWT, PostgreSQL
- AI: OpenAI Responses API (async via Celery + Redis)
- Frontend: React (Vite), Tailwind, Recharts
- Dev services: Docker Compose (Postgres + Redis)

## Quick start (local dev)

### 0) Prereqs
- Python 3.11+
- Node 18+ (Node 20 recommended)
- Docker Desktop

## macOS Docker PATH fix (important)
zsh: command not found: docker
Then Run this command: echo 'export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"' >> ~/.zshrc
Then Run this: source ~/.zshrc
docker --version

### 1) Start Postgres + Redis
```bash
docker compose up -d db redis
```

### 2) Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # mac/linux
# .venv\Scripts\activate  # windows powershell

pip install -r requirements.txt

cp .env.example .env   #Only One time will setup your project for first time
# Edit .env (set OPENAI_API_KEY, SECRET_KEY)

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

In another terminal (same venv):
```bash
cd backend
source .venv/bin/activate
celery -A supportdesk worker -l info
```

API docs:
- Swagger UI: http://127.0.0.1:8000/api/docs/
- OpenAPI schema: http://127.0.0.1:8000/api/schema/

### 3) Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open: http://127.0.0.1:5173

## Demo flow
1) Register a user and login
2) Create a ticket
3) Watch AI fields populate after a few seconds (refresh)
4) Login as superuser (agent/admin) to view Admin Dashboard

## Notes
- If you don't set OPENAI_API_KEY, the AI step falls back to a simple rule-based classifier.
