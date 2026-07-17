from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    booking_id: str
    amount: float
    payment_method: str # 'cash', 'card', 'online'

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: str
    user_id: str
    payment_status: str # 'pending', 'completed', 'failed', 'refunded'
    transaction_reference: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
