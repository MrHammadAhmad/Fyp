from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# --- Payout Account ---
class PayoutAccountCreate(BaseModel):
    salon_id: str
    bank_name: str
    account_last4: str
    routing_last4: str

class PayoutAccountUpdate(BaseModel):
    bank_name: Optional[str] = None
    account_last4: Optional[str] = None
    routing_last4: Optional[str] = None

class PayoutAccountResponse(BaseModel):
    id: str
    salon_id: str
    bank_name: str
    account_last4: str
    routing_last4: str
    created_at: Optional[datetime] = None

# --- Manual Charge ---
class ManualChargeCreate(BaseModel):
    salon_id: str
    customer_name: str
    description: Optional[str] = "Manual Charge"
    amount: float

class ManualChargeResponse(BaseModel):
    id: str
    salon_id: str
    customer_name: str
    description: Optional[str] = None
    amount: float
    status: str
    created_at: Optional[datetime] = None

# --- Withdrawal ---
class WithdrawalCreate(BaseModel):
    salon_id: str
    amount: float
    payout_account_id: str

class WithdrawalResponse(BaseModel):
    id: str
    salon_id: str
    amount: float
    payout_account_id: str
    status: str
    created_at: Optional[datetime] = None
