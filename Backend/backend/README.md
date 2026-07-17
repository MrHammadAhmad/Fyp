# AI-Powered Salon Booking Backend

This is the FastAPI backend for an AI-powered salon booking and personalization platform.

## What this backend does

- User authentication (signup/login via Supabase Auth) with role-based access control
- Role-based endpoints for **Customer**, **Salon Owner**, and **Admin** users
- Salon management
- Service management
- Appointment booking and status updates
- Reviews
- Stripe payment intent support (basic)
- Gemini AI chat and service recommendations

## User Roles

- **Customer** - Book appointments, leave reviews, view salons and services
- **Salon Owner** - Create and manage salons, add services, manage appointments
- **Admin** - System administrator with full access to manage users and platform

## Tech stack

- FastAPI
- Supabase (Auth + Postgres)
- Stripe
- Google Gemini API
- Pydantic

## Project structure

- `app/main.py` - FastAPI app entry point and router registration
- `app/core/config.py` - environment-based settings
- `app/core/security.py` - bearer token parsing and JWT decode logic
- `app/api/` - route handlers grouped by feature
- `app/services/` - integrations (Supabase, Stripe, Gemini)
- `app/schemas/` - request/response Pydantic models
- `supabase_schema.sql` - database schema and RLS policies

## How to run

1. Create or activate a Python virtual environment.
2. Install dependencies.
3. Create `.env` in `backend/` (can copy from `.env.example`).
4. Start server:

```bash
uvicorn app.main:app --reload
```

If `uvicorn` is not in PATH, run:

```bash
python -m uvicorn app.main:app --reload
```

## API docs

- Swagger UI: http://127.0.0.1:8000/docs
- OpenAPI JSON: http://127.0.0.1:8000/openapi.json

## Required environment variables

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `GEMINI_API_KEY`
- `SECRET_KEY`

## Main API groups

- `/api/auth` - signup and login
- `/api/salons` - salon CRUD (basic)
- `/api/services` - service create/list by salon
- `/api/appointments` - book, list, update status
- `/api/reviews` - create/list reviews
- `/api/payment` - webhook placeholder
- `/api/ai` - chat and recommendations

## Role-Based Access Control

The API uses JWT-based authentication with role checks:

- Use `Depends(get_current_user)` for any authenticated user
- Use `Depends(get_current_owner)` for salon owner-only endpoints
- Use `Depends(get_current_admin)` for admin-only endpoints

Example:

```python
from app.core.security import get_current_admin

@router.delete("/users/{user_id}")
def delete_user(user_id: str, current_user: dict = Depends(get_current_admin)):
    # Only admin users can execute this
    return {"message": "User deleted"}
```

## Note

Some integrations require valid keys and compatible package versions. If third-party SDK versions conflict with your Python version, pin working versions in a `requirements.txt` file.
