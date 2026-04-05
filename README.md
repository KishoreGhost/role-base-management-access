# FinSight CRM Assessment

FinSight is a comprehensive finance dashboard and CRM system built to demonstrate robust backend architecture, access control, and data processing capabilities. Designed to fulfill the constraints of the **Finance Data Processing and Access Control Backend** assessment, it allows different users to interact with financial records based on finely-tuned roles.

## Overview

At its core, FinSight addresses the primary requirements outlined in the `project_summary.md`:
- **User & Role Management**: Multi-tiered role-based access control (RBAC) supporting Viewer, Analyst, Operator, and Admin roles. Users can be active or inactive, with authentication and permissions strictly enforced.
- **Financial Records Management**: Complete CRUD operations for financial entries (income and expenses), including categorization, monetary fields, dates, notes, and advanced filtering.
- **Dashboard Summary Analytics**: Optimized APIs providing aggregated insights such as total income, total expenses, net balance, category-wise distributions, and recent financial activity.
- **Strict Access Control Flow**: Layered endpoint protection utilizing JWT token-based authentication and route-level dependency injection to ensure unauthorized actions are strictly rejected.
- **Robust Validation & Error Handling**: Extensive use of Pydantic schemas to validate incoming data, ensure type safety, prevent invalid states, and provide meaningful HTTP error responses for edge cases.
- **Data Persistence**: A fully structured backend powered by SQLAlchemy and Alembic for maintainable SQL database schema management, utilizing SQLite for out-of-the-box evaluation simplicity.

## What is included
- FastAPI backend with SQLite persistence
- JWT authentication with seeded demo users
- Four roles: Viewer, Analyst, Operator, Admin
- Financial records CRUD with filtering and soft delete
- Category management
- Dashboard summary APIs
- Admin-only secret insights API
- Next.js frontend with real login, protected routes, live backend reads, supported write actions, session-expiry handling, and frontend tests
- Alembic-based database migrations

## Architecture

### Backend
- `backend/app/main.py` — FastAPI entrypoint
- `backend/app/core/` — settings, enums, security, permissions
- `backend/app/db/` — database session, initialization, seeding
- `backend/app/models/` — SQLAlchemy models
- `backend/app/schemas/` — request/response validation
- `backend/app/api/` — route handlers and dependencies
- `backend/app/services/` — analytics and audit helpers
- `backend/app/tests/` — API tests
- `backend/alembic/` — Alembic migration scripts

### Frontend
- `frontend/src/app/` — Next.js App Router routes
- `frontend/src/components/` — auth, shell, dashboard, records, categories, users, insights
- `frontend/src/lib/api/` — API clients for auth, dashboard, records, categories, users
- `frontend/src/lib/auth/` — auth state, token handling, and expiry events
- `frontend/src/components/**/*.test.tsx` — Vitest + RTL frontend tests

## Data model highlights
The implementation goes beyond the minimum prompt schema and includes:
- user status and department
- record currency, subcategory, payment method, reference code, and soft-delete fields
- audit logs for key actions
- admin-only secret insight records
- enriched record responses with nested category details for frontend rendering

## Role feature matrix
| Role | Dashboard | Records read | Records create/update | Records delete | Categories read | Categories create/update | Users manage | Secret insights |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Viewer | Yes | Yes | No | No | Yes | No | No | No |
| Analyst | Yes | Yes | No | No | Yes | No | No | No |
| Operator | Yes | Yes | Yes | No | Yes | No | No | No |
| Admin | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |

## Demo accounts
All demo users use the password `Password123!`.

- `viewer@finsightcrm.com`
- `analyst@finsightcrm.com`
- `operator@finsightcrm.com`
- `admin@finsightcrm.com`

## Backend setup
Create and use the local virtual environment:

```bash
cd "backend"
python -m venv .venv
".venv/Scripts/python.exe" -m pip install --upgrade pip
".venv/Scripts/python.exe" -m pip install -r requirements.txt
```

## Run backend migrations
```bash
cd "backend"
".venv/Scripts/alembic.exe" upgrade head
```

## Run the backend
```bash
cd "backend"
".venv/Scripts/python.exe" -m uvicorn app.main:app --reload --app-dir .
```

API URLs:
- Health: `http://127.0.0.1:8000/health`
- OpenAPI: `http://127.0.0.1:8000/docs`

## Run backend tests
```bash
cd "backend"
".venv/Scripts/python.exe" -c "import sys, pytest; sys.path.insert(0, '.'); raise SystemExit(pytest.main(['app/tests/test_api.py', '-q']))"
```

## Run the frontend
```bash
cd "frontend"
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Run frontend tests
```bash
cd "frontend"
npm test
```

### Optional frontend API base override
By default the frontend talks to `http://127.0.0.1:8000/api`.

If needed, create `frontend/.env.local` with:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

## Notes and assumptions
- SQLite was chosen to keep setup friction low for an assessment.
- Alembic is now the intended schema management path instead of runtime `create_all`.
- The backend seeded data is the source of truth for frontend reads.
- Secret Sauce is enforced in the backend via `/api/admin/insights` and rendered only for admins in the frontend.
- The frontend stores the bearer token in browser local storage for this assessment demo.

## Acknowledgements
This project was built with the assistance of AI tools like Claude and Codex to enhance development time and bootstrap boilerplate code. However, the architecture, routing, component logic, and database schemas were completely planned by me, and the entire system has been thoroughly tested.
