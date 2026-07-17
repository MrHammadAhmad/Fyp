from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MembershipCreate(BaseModel):
    salon_id: str
    name: str
    price: float
    duration: str          # e.g. "1 Month", "3 Months"
    perks: Optional[str] = None
    is_active: Optional[bool] = True

class MembershipUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[str] = None
    perks: Optional[str] = None
    is_active: Optional[bool] = None

class MembershipResponse(BaseModel):
    id: str
    salon_id: str
    name: str
    price: float
    duration: Optional[str] = None
    perks: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserMembershipResponse(BaseModel):
    id: str
    user_id: str
    membership_id: str
    salon_id: str
    status: str
    start_date: datetime
    end_date: Optional[datetime] = None
    created_at: datetime
    membership_details: Optional[dict] = None

    class Config:
        from_attributes = True
