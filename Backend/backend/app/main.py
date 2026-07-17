from fastapi import FastAPI
from app.core.config import settings
from app.api import auth, salons, services, appointments, reviews, payment, ai, uploads, admin, announcements, support, notifications, faq, owner, favorites, staff, memberships, payout

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for AI-Powered Salon Booking and Personalization Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from app.services.supabase_db import request_supabase, url, key
from supabase import create_client

@app.middleware("http")
async def supabase_client_middleware(request: Request, call_next):
    client = None
    try:
        client = create_client(url, key)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            client.postgrest.auth(token)
    except Exception as e:
        print(f"Failed to initialize request Supabase client: {e}")
        client = None

    token_token = request_supabase.set(client)
    try:
        response = await call_next(request)
        return response
    finally:
        request_supabase.reset(token_token)


app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(salons.router, prefix="/api/salons", tags=["Salons"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(payment.router, prefix="/api/payment", tags=["Payment"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Integration"])
app.include_router(uploads.router, prefix="/api/upload", tags=["Uploads"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin Controls"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["Announcements"])
app.include_router(support.router, prefix="/api/support", tags=["Support Tickets"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(faq.router, prefix="/api/faq", tags=["FAQs"])
app.include_router(owner.router, prefix="/api/owner", tags=["Owner Controls"])
app.include_router(favorites.router, prefix="/api/favorites", tags=["Favorites"])
app.include_router(staff.router, prefix="/api/staff", tags=["Staff Management"])
app.include_router(memberships.router, prefix="/api/memberships", tags=["Memberships"])
app.include_router(payout.router, prefix="/api/payout", tags=["Payout & Charges"])





from app.core.scheduler import start_scheduler

@app.on_event("startup")
def on_startup():
    start_scheduler()

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Powered Salon Booking API"}
