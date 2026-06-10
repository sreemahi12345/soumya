# Sowmyakka Backend

FastAPI backend for reachout form submission.

## Features
- Accepts reachout form data from frontend
- Saves submission in SQLite database
- Sends submission details to configured email

## Setup
1. Create and activate virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy environment values from root `.env` or create `backend/.env` from `.env.example`.

## Run

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API endpoint:
- `POST /api/reachout`

Health check:
- `GET /`
