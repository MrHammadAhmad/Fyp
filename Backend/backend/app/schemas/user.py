from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str # "customer", "owner", or "admin"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    phone: Optional[str] = None
    is_blocked: bool
    referral_code: Optional[str] = None
    referred_by: Optional[str] = None

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    new_password: str

