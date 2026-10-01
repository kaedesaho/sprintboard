# SprintBoard

A full-stack project management web app for organizing sprints, tracking tasks, and collaborating with your team.

---

## Features

- **Four task views** — Kanban board, Gantt chart, List, and Backlog
- **Kanban board** — drag cards between columns to change status; each column is sorted by priority (high → low)
- **Project Overview dashboard** — sprint progress bar, your assigned tasks, overdue tasks, and blocked/high-priority items
- **Sprint-based task management** — filter and track work by sprint number
- **Rich task fields** — status, priority, assignees, due dates, time estimate, dependencies, and categories
- **Project Notes** — meeting notes, retrospectives, documentation, and more with shared/private visibility
- **Team membership** — invite members with Admin or Member roles
- **User profiles** — avatar upload, display name

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, React Router v7 |
| State | Context API (Auth, Project) |
| Drag & Drop | `@hello-pangea/dnd` |
| Backend | Python, Flask, Flask-CORS |
| Database | PostgreSQL |
| DB Driver | psycopg2 |

---

## Project Structure

```
SprintBoard/
├── frontend/
│   └── src/
│       ├── pages/          # Route-level page components
│       ├── components/     # Reusable UI components
│       │   └── views/      # Kanban, Gantt, List, Backlog view implementations
│       ├── context/        # AuthContext, ProjectContext
│       ├── types/          # TypeScript interfaces
│       └── utils/
└── backend/
    ├── app.py              # Flask app entry point
    ├── db.py               # PostgreSQL connection
    ├── schema.sql          # Full database schema
    └── routes/
        ├── users.py
        ├── projects.py
        ├── tasks.py
        └── notes.py
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL

### 1. Database

Create a PostgreSQL database and run the schema:

```bash
psql -U postgres -c "CREATE DATABASE sprintboard_db;"
psql -U postgres -d sprintboard_db -f backend/schema.sql
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
DB_NAME=sprintboard_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
```

Start the Flask server:

```bash
python app.py
```

The API will be available at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Overview

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/signup` | Register a new user |
| POST | `/users/login` | Log in |
| GET | `/projects` | Get all projects for the logged-in user |
| POST | `/projects` | Create a new project |
| GET | `/tasks/:projectId/tasks` | Get all tasks in a project |
| POST | `/tasks` | Create a task |
| PATCH | `/tasks/:taskId` | Update a task |
| DELETE | `/tasks/:taskId` | Delete a task |
| GET | `/notes` | Get notes for a project |

---

## Database Schema

Key tables:

- **`users`** — user accounts with optional avatar URL
- **`projects`** — projects with title, description, current sprint
- **`project_members`** — many-to-many with role (`Admin` / `Member`)
- **`tasks`** — core task data; status and priority stored as PostgreSQL enums
- **`task_assignees`** — many-to-many: tasks ↔ users
- **`task_dependencies`** — tasks that must be completed before another
- **`task_categories`** — many-to-many: tasks ↔ custom project categories
- **`notes`** — project notes with type, sprint number, and sharing controls

Full schema: [`backend/schema.sql`](backend/schema.sql)
