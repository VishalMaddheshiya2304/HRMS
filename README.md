# HRMS Lite — Human Resource Management System

A lightweight, production-ready HRMS built for managing employee records and daily attendance tracking.

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | _Add your Vercel URL here_ |
| Backend API | _Add your Render URL here_ |

---

## Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React 18, Vite, Tailwind CSS |
| Backend    | Python 3.11, FastAPI    |
| Database   | SQLite (dev) / PostgreSQL (prod) |
| ORM        | SQLAlchemy 2.0          |
| Validation | Pydantic v2             |
| Deploy FE  | Vercel                  |
| Deploy BE  | Render                  |

---

## Features

- **Employee Management** — Add, view, search, and delete employees
- **Attendance Tracking** — Mark daily attendance (Present/Absent) per employee
- **Dashboard** — Summary statistics, department breakdown, top attendance
- **Filters** — Filter attendance by employee and/or date
- **Validations** — Duplicate ID/email prevention, required field checks, email format validation
- **UI States** — Loading spinners, empty states, error banners on every view

---

## Running Locally

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- pip

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/hrms-lite.git
cd hrms-lite
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

Then start the dev server:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Deployment

### Backend → Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add a **PostgreSQL** database (free tier) and link the `DATABASE_URL` environment variable
6. Deploy — note your public URL (e.g. `https://hrms-lite-backend.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select the repo, set **Root Directory** to `frontend`
3. Add Environment Variable:
   - `VITE_API_URL` = your Render backend URL (no trailing slash)
4. Deploy

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Create employee |
| DELETE | `/api/employees/{id}` | Delete employee |
| GET | `/api/attendance` | List attendance (supports `?employee_id=` and `?date=`) |
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/dashboard/stats` | Summary statistics |

Full interactive docs available at `/docs` when backend is running.

---

## Project Structure

```
hrms-lite/
├── backend/
│   ├── main.py          # FastAPI routes
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── database.py      # DB connection
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios API client
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level pages
│   │   └── styles/      # Global CSS
│   ├── vercel.json
│   └── package.json
├── render.yaml
└── README.md
```

---

## Assumptions & Limitations

- Single admin user — no authentication required per the spec
- Attendance is one record per employee per day (duplicate prevention enforced)
- SQLite is used for local development; PostgreSQL is used on Render
- Leave management, payroll, and roles are out of scope
- Deleting an employee cascades and removes all their attendance records
