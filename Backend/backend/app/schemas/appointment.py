from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class AppointmentBase(BaseModel):
    salon_id: str
    service_id: str
    date: date
    time: time
    booking_type: str # "online" or "walk-in"

class AppointmentCreate(AppointmentBase):
    user_id: Optional[str] = None      # nullable for walk-in
    customer_name: Optional[str] = None # walk-in customer name
    customer_phone: Optional[str] = None # walk-in customer phone
    staff_id: Optional[str] = None      # assigned staff member
    notes: Optional[str] = None         # special requests / notes
    payment_method: Optional[str] = "cash" # wallet, cash
    payment_status: Optional[str] = None # 'paid' or 'pending'

class AppointmentResponse(AppointmentBase):
    id: str
    user_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    staff_id: Optional[str] = None
    notes: Optional[str] = None
    status: str # pending, confirmed, completed, cancelled, no-show
    payment_status: str # paid, unpaid, refunded

    # Optional enriched fields for frontend rendering
    serviceName: Optional[str] = None
    businessName: Optional[str] = None
    businessImage: Optional[str] = None
    duration: Optional[int] = None
    price: Optional[float] = None
    staffName: Optional[str] = None
    customerName: Optional[str] = None
    customerEmail: Optional[str] = None

    class Config:
        from_attributes = True

class AppointmentStatusUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None

class AppointmentReschedule(BaseModel):
    date: date
    time: time
