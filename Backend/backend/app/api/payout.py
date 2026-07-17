from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.schemas.payout import (
    PayoutAccountCreate, PayoutAccountUpdate, PayoutAccountResponse,
    ManualChargeCreate, ManualChargeResponse,
    WithdrawalCreate, WithdrawalResponse
)
from app.services.supabase_db import supabase, supabase_admin
from app.core.security import get_current_owner

router = APIRouter()

def _verify_salon_owner(salon_id: str, current_user: dict):
    """Verify the current owner owns the given salon."""
    salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", salon_id).execute()
    if not salon_res.data:
        raise HTTPException(status_code=404, detail="Salon not found")
    if salon_res.data[0]["owner_id"] != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access payout data for this salon")


# ─────────────────────────────────────────────
# PAYOUT ACCOUNT ENDPOINTS
# ─────────────────────────────────────────────

@router.get("/account", response_model=Optional[PayoutAccountResponse])
def get_payout_account(salon_id: str, current_user: dict = Depends(get_current_owner)):
    """Get the registered payout bank account for a salon."""
    try:
        _verify_salon_owner(salon_id, current_user)
        res = supabase_admin.table("PayoutAccounts").select("*").eq("salon_id", salon_id).limit(1).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/account", response_model=PayoutAccountResponse, status_code=status.HTTP_201_CREATED)
def create_payout_account(account: PayoutAccountCreate, current_user: dict = Depends(get_current_owner)):
    """Register a payout bank account for a salon (replaces existing)."""
    try:
        _verify_salon_owner(account.salon_id, current_user)
        # Delete any existing account for this salon first (one account per salon)
        supabase_admin.table("PayoutAccounts").delete().eq("salon_id", account.salon_id).execute()
        res = supabase_admin.table("PayoutAccounts").insert(account.model_dump()).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/account/{account_id}", response_model=PayoutAccountResponse)
def update_payout_account(account_id: str, update: PayoutAccountUpdate, current_user: dict = Depends(get_current_owner)):
    """Update payout bank account details."""
    try:
        existing = supabase_admin.table("PayoutAccounts").select("salon_id").eq("id", account_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Payout account not found")

        _verify_salon_owner(existing.data[0]["salon_id"], current_user)

        update_data = {k: v for k, v in update.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields provided for update")

        res = supabase_admin.table("PayoutAccounts").update(update_data).eq("id", account_id).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


# ─────────────────────────────────────────────
# MANUAL CHARGES ENDPOINTS
# ─────────────────────────────────────────────

@router.get("/charges", response_model=List[ManualChargeResponse])
def get_manual_charges(salon_id: str, current_user: dict = Depends(get_current_owner)):
    """Get all manual charges logged for a salon."""
    try:
        _verify_salon_owner(salon_id, current_user)
        res = supabase_admin.table("ManualCharges").select("*").eq("salon_id", salon_id).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/charges", response_model=ManualChargeResponse, status_code=status.HTTP_201_CREATED)
def create_manual_charge(charge: ManualChargeCreate, current_user: dict = Depends(get_current_owner)):
    """Log a new manual card charge."""
    try:
        _verify_salon_owner(charge.salon_id, current_user)
        payload = {**charge.model_dump(), "status": "paid"}
        res = supabase_admin.table("ManualCharges").insert(payload).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/charges/{charge_id}")
def delete_manual_charge(charge_id: str, current_user: dict = Depends(get_current_owner)):
    """Delete a manual charge record."""
    try:
        existing = supabase_admin.table("ManualCharges").select("salon_id").eq("id", charge_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Charge not found")
        _verify_salon_owner(existing.data[0]["salon_id"], current_user)
        supabase_admin.table("ManualCharges").delete().eq("id", charge_id).execute()
        return {"message": "Charge deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


# ─────────────────────────────────────────────
# WITHDRAWALS ENDPOINTS
# ─────────────────────────────────────────────

@router.get("/withdrawals", response_model=List[WithdrawalResponse])
def get_withdrawals(salon_id: str, current_user: dict = Depends(get_current_owner)):
    """Get all withdrawals logged for a salon."""
    try:
        _verify_salon_owner(salon_id, current_user)
        res = supabase_admin.table("Withdrawals").select("*").eq("salon_id", salon_id).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/withdrawals", response_model=WithdrawalResponse, status_code=status.HTTP_201_CREATED)
def create_withdrawal(withdrawal: WithdrawalCreate, current_user: dict = Depends(get_current_owner)):
    """Log a new withdrawal/payout transfer."""
    try:
        _verify_salon_owner(withdrawal.salon_id, current_user)
        payload = {**withdrawal.model_dump(), "status": "completed"}
        res = supabase_admin.table("Withdrawals").insert(payload).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))
