import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Salon Booking"
    VERSION: str = "1.0.0"
    
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    STRIPE_SECRET_KEY: str
    GEMINI_API_KEY: str
    GROQ_API_KEY: str
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    RESEND_API_KEY: str
    RESEND_FROM_EMAIL: str = "noreply@resend.dev"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
