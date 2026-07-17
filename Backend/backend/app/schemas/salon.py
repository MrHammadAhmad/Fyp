from pydantic import BaseModel
from typing import Optional, List

class SalonBase(BaseModel):
    name: str
    location: str
    description: Optional[str] = None
    address: Optional[str] = None
    contact_info: Optional[str] = None
    opening_hours: Optional[str] = None
    
    # New location fields for granular setups
    country: Optional[str] = None
    city: Optional[str] = None
    town: Optional[str] = None
    shop_no: Optional[str] = None
    street_address: Optional[str] = None
    cover_image: Optional[str] = None
    images: Optional[List[str]] = None

    # Booking preferences
    enable_online_booking: Optional[bool] = True
    allow_walkin_bookings: Optional[bool] = True

    # Cancellation policy
    cancellation_hours: Optional[int] = 24
    cancellation_fee: Optional[float] = 0
    allow_noshow_rebooking: Optional[bool] = True

class SalonCreate(SalonBase):
    pass

class SalonUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    contact_info: Optional[str] = None
    opening_hours: Optional[str] = None
    
    country: Optional[str] = None
    city: Optional[str] = None
    town: Optional[str] = None
    shop_no: Optional[str] = None
    street_address: Optional[str] = None
    cover_image: Optional[str] = None
    images: Optional[List[str]] = None

    # Booking preferences
    enable_online_booking: Optional[bool] = None
    allow_walkin_bookings: Optional[bool] = None

    # Cancellation policy
    cancellation_hours: Optional[int] = None
    cancellation_fee: Optional[float] = None
    allow_noshow_rebooking: Optional[bool] = None

class SalonResponse(SalonBase):
    id: str
    owner_id: str
    average_rating: Optional[float] = 0.0

    class Config:
        from_attributes = True
