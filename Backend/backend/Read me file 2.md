# Read me file 2 (Detailed Flow and Explanation)

This file explains the backend in detail, including where the project starts, how requests move through the system while running, and where each request ends.

## 1) Where the project starts

The project starts at:

- `app/main.py`

When you run:

```bash
uvicorn app.main:app --reload
```

Uvicorn imports `app.main`, creates the FastAPI app object, and registers all routers.

### Startup sequence

1. Uvicorn loads module `app.main`.
2. `app/main.py` imports `settings` from `app/core/config.py`.
3. `config.py` loads environment variables from `.env` using `pydantic-settings`.
4. `FastAPI(...)` app is created.
5. Routers are mounted with prefixes:
   - `/api/auth`
   - `/api/salons`
   - `/api/services`
   - `/api/appointments`
   - `/api/reviews`
   - `/api/payment`
   - `/api/ai`
6. Server begins listening on `http://127.0.0.1:8000`.

So, project entry is `app/main.py`, and runtime starts when Uvicorn serves that app.

## 2) How request flow works while project is running (on-going)

Each incoming request generally follows this path:

1. Client sends HTTP request.
2. FastAPI router in `app/api/*.py` matches endpoint.
3. Pydantic schemas in `app/schemas/*.py` validate request body/path params.
4. Dependency functions (like auth checks) run from `app/core/security.py`.
5. Route handler calls service layer functions in `app/services/*.py`.
6. Service layer talks to external systems (Supabase, Stripe, Gemini).
7. Handler returns JSON response.

## 3) How authentication and roles work in this project

Files involved:

- `app/api/auth.py`
- `app/core/security.py`
- `app/schemas/user.py`

Flow:

1. `/api/auth/signup` creates user via Supabase Auth (defaults to "customer" role).
2. `/api/auth/login` returns access token with user info and role.
3. Protected endpoints use one of these dependencies:
   - `Depends(get_current_user)` - any authenticated user
   - `Depends(get_current_owner)` - only salon owners
   - `Depends(get_current_admin)` - only admins
4. `get_current_user` reads bearer token and decodes JWT with `SECRET_KEY`.
5. User info (id, role) is injected into endpoint function.
6. Owner/Admin dependencies validate role and return 403 Forbidden if unauthorized.

### Three Roles in the System

1. **Customer** (default)
   - Can book appointments
   - Can leave reviews
   - Can view salons and services
   - Can use AI chat and recommendations

2. **Owner** (Salon Owner)
   - Can create and manage salons
   - Can add services to their salons
   - Can view and update appointment statuses
   - Can view reviews

3. **Admin**
   - Full system access
   - Can manage all users
   - Can manage all salons (future implementation)
   - Can view system reports (future implementation)

## 4) Module-by-module explanation

### A) Auth (`app/api/auth.py`)

- Signup and login with Supabase.
- Returns user/session data.

### B) Salons (`app/api/salons.py`)

- List salons, create salon, get salon by id.
- Owner checks use dependency function.

### C) Services (`app/api/services.py`)

- Create service under a salon.
- List services for a salon.

### D) Appointments (`app/api/appointments.py`)

- Book appointment.
- Auto-sets status/payment defaults.
- For online booking, can create Stripe payment intent.
- Owners can update appointment status.

### E) Reviews (`app/api/reviews.py`)

- Create review (authenticated user).
- Get reviews by salon.

### F) Payment (`app/api/payment.py`)

- Webhook placeholder endpoint currently returns success.

### G) AI (`app/api/ai.py`)

- `/chat` uses Gemini for reply.
- `/recommendations` fetches salon services and requests recommendation from Gemini.

## 5) Service layer details

### Supabase (`app/services/supabase_db.py`)

- Initializes Supabase client using `SUPABASE_URL` and `SUPABASE_KEY`.
- Exposes shared `supabase` object used by API modules.

### Stripe (`app/services/stripe_service.py`)

- Uses `STRIPE_SECRET_KEY`.
- Creates payment intents.
- Handles refund helper.

### Gemini (`app/services/gemini_service.py`)

- Uses `GEMINI_API_KEY`.
- Provides chat response and recommendation functions.

## 6) Data layer (database)

Schema file:

- `supabase_schema.sql`

Core tables:

- `Users`
- `Salons`
- `Services`
- `Appointments`
- `Reviews`

Also includes basic RLS policies for row-level access control.

## 7) Where a request ends

A request ends in one of these outcomes:

1. Success response returned from endpoint (200/201, etc.).
2. Validation/auth/business error returned via `HTTPException` (4xx/5xx).
3. External integration failure (Supabase/Stripe/Gemini) converted to error response.

Technically, endpoint execution ends when FastAPI sends the final JSON response back to the client.

## 8) Full lifecycle summary (Start -> On-going -> End)

### Start

- Command: `uvicorn app.main:app --reload`
- Entry file: `app/main.py`
- Settings load from `.env`
- Routers register
- Server listens on port 8000

### On-going (while running)

- Requests hit route handlers
- Input validated by schemas
- Auth dependency resolves user
- Service layer executes external calls
- DB operations run through Supabase client

### End

- Each request ends with response success/error
- Whole project run ends when server process is stopped (Ctrl+C or process exit)

## 9) Useful URLs

- Root: `http://127.0.0.1:8000/`
- Swagger docs: `http://127.0.0.1:8000/docs`
- OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

## 10) Required `.env` keys

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `GEMINI_API_KEY`
- `SECRET_KEY`

## 11) Security Dependencies Available

Use these in your endpoints for role-based access:

```python
from app.core.security import get_current_user, get_current_owner, get_current_admin

# Any authenticated user
@router.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    return {"user_id": current_user["id"], "role": current_user["role"]}

# Only salon owners
@router.post("/salons")
def create_salon(salon_data: dict, current_user: dict = Depends(get_current_owner)):
    # Only owners can create salons
    pass

# Only admins
@router.delete("/users/{user_id}")
def delete_user(user_id: str, current_user: dict = Depends(get_current_admin)):
    # Only admins can delete users
    pass
```
