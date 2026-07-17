from fastapi import APIRouter, Request, HTTPException, Header, Depends
from app.core.config import settings
from app.services.supabase_db import supabase, supabase_admin
from app.core.security import get_current_user
from app.schemas.payment import PaymentCreate, PaymentResponse
from typing import List

router = APIRouter()

@router.post("/cash", response_model=PaymentResponse)
def handle_cash_payment(payment: PaymentCreate, current_user: dict = Depends(get_current_user)):
    try:
        if payment.payment_method != "cash":
            raise HTTPException(status_code=400, detail="Invalid payment method for this endpoint")
            
        # Verify appointment exists
        apt_res = supabase.table("Appointments").select("*").eq("id", payment.booking_id).execute()
        if not apt_res.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        appointment = apt_res.data[0]
        if appointment["user_id"] != current_user["id"] and current_user.get("role") not in ["admin", "owner"]:
            raise HTTPException(status_code=403, detail="Not authorized to set payment for this appointment")
            
        # Log cash payment
        pay_data = {
            "booking_id": payment.booking_id,
            "user_id": appointment["user_id"],
            "amount": payment.amount,
            "payment_method": "cash",
            "payment_status": "pending" # pending until owner marks it received
        }
        res = supabase.table("Payments").insert(pay_data).execute()
        
        # We can update appointment to cash so it's known
        supabase.table("Appointments").update({"payment_status": "unpaid"}).eq("id", appointment["id"]).execute()
        
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history", response_model=List[PaymentResponse])
def get_payment_history(current_user: dict = Depends(get_current_user)):
    try:
        res = supabase.table("Payments").select("*").eq("user_id", current_user["id"]).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- WALLET ENDPOINTS ---

from pydantic import BaseModel
from datetime import datetime

class TopUpRequest(BaseModel):
    amount: float

@router.get("/wallet/balance")
def get_wallet_balance(current_user: dict = Depends(get_current_user)):
    try:
        # Fetch user's wallet_balance and loyalty_points from public.Users
        user_res = supabase.table("Users").select("wallet_balance, loyalty_points").eq("id", current_user["id"]).execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        user_data = user_res.data[0]
        
        # Fetch payments/transactions
        pay_res = supabase.table("Payments")\
            .select("*, Appointments(Services(name), Salons(name))")\
            .eq("user_id", current_user["id"])\
            .order("created_at", desc=True)\
            .execute()
            
        transactions = []
        for p in pay_res.data:
            title = "Wallet Top Up"
            business = None
            tx_type = "topup"
            
            apt = p.get("Appointments")
            if apt:
                tx_type = "payment" if p["payment_status"] == "completed" else "refund" if p["payment_status"] == "refunded" else "payment"
                service = (apt.get("Services") or {}) if isinstance(apt.get("Services"), dict) else {}
                salon = (apt.get("Salons") or {}) if isinstance(apt.get("Salons"), dict) else {}
                title = f"Payment for {service.get('name', 'Service')}"
                business = salon.get("name")
                
            transactions.append({
                "id": p["id"],
                "type": tx_type,
                "amount": float(p["amount"]),
                "date": p["created_at"],
                "title": title,
                "business": business
            })
            
        return {
            "wallet_balance": float(user_data["wallet_balance"]),
            "loyalty_points": int(user_data["loyalty_points"]),
            "transactions": transactions
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/wallet/topup")
def topup_wallet(request: TopUpRequest, current_user: dict = Depends(get_current_user)):
    try:
        if request.amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than zero")
            
        # Get current balance
        user_res = supabase.table("Users").select("wallet_balance").eq("id", current_user["id"]).execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        new_balance = float(user_res.data[0]["wallet_balance"]) + request.amount
        
        # Update user's wallet_balance in public.Users using admin client
        from app.services.supabase_db import supabase_admin
        supabase_admin.table("Users").update({"wallet_balance": new_balance}).eq("id", current_user["id"]).execute()
        
        # Log payment (top-up)
        pay_data = {
            "booking_id": None,
            "user_id": current_user["id"],
            "amount": request.amount,
            "payment_method": "card",
            "payment_status": "completed",
            "transaction_reference": f"topup_{int(datetime.now().timestamp())}"
        }
        pay_res = supabase_admin.table("Payments").insert(pay_data).execute()
        
        return {"message": "Top up successful", "wallet_balance": new_balance, "transaction": pay_res.data[0]}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))
