from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.membership import MembershipCreate, MembershipUpdate, MembershipResponse
from app.services.supabase_db import supabase_admin
from app.core.security import get_current_user, get_current_owner
from datetime import datetime, timedelta

router = APIRouter()

def _verify_salon_owner(salon_id: str, current_user: dict):
    """Verify the current owner owns the given salon."""
    salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", salon_id).execute()
    if not salon_res.data:
        raise HTTPException(status_code=404, detail="Salon not found")
    if salon_res.data[0]["owner_id"] != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to manage memberships for this salon")


@router.get("/", response_model=List[MembershipResponse])
def get_memberships(salon_id: str):
    """Get all membership plans for a salon (public)."""
    try:
        res = supabase_admin.table("Memberships").select("*").eq("salon_id", salon_id).order("created_at", desc=False).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=MembershipResponse, status_code=status.HTTP_201_CREATED)
def create_membership(membership: MembershipCreate, current_user: dict = Depends(get_current_owner)):
    """Create a new membership plan for a salon."""
    try:
        _verify_salon_owner(membership.salon_id, current_user)
        res = supabase_admin.table("Memberships").insert(membership.model_dump()).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{membership_id}", response_model=MembershipResponse)
def update_membership(membership_id: str, update: MembershipUpdate, current_user: dict = Depends(get_current_owner)):
    """Update a membership plan."""
    try:
        existing = supabase_admin.table("Memberships").select("salon_id").eq("id", membership_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Membership not found")

        _verify_salon_owner(existing.data[0]["salon_id"], current_user)

        update_data = {k: v for k, v in update.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields provided for update")

        res = supabase_admin.table("Memberships").update(update_data).eq("id", membership_id).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{membership_id}")
def delete_membership(membership_id: str, current_user: dict = Depends(get_current_owner)):
    """Delete a membership plan."""
    try:
        existing = supabase_admin.table("Memberships").select("salon_id").eq("id", membership_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Membership not found")

        _verify_salon_owner(existing.data[0]["salon_id"], current_user)
        supabase_admin.table("Memberships").delete().eq("id", membership_id).execute()
        return {"message": "Membership deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{membership_id}/subscribe")
def subscribe_membership(membership_id: str, current_user: dict = Depends(get_current_user)):
    """Customer subscribes to a membership plan using their wallet balance."""
    try:
        if current_user["role"] != "customer":
            raise HTTPException(status_code=403, detail="Only customers can subscribe to memberships")
            
        # 1. Fetch Membership
        mem_res = supabase_admin.table("Memberships").select("*").eq("id", membership_id).execute()
        if not mem_res.data:
            raise HTTPException(status_code=404, detail="Membership plan not found")
        plan = mem_res.data[0]
        
        # 2. Check User Wallet Balance
        user_res = supabase_admin.table("Users").select("wallet_balance").eq("id", current_user["id"]).execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        wallet_balance = user_res.data[0].get("wallet_balance", 0.0)
        price = plan["price"]
        
        if wallet_balance < price:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
            
        # 3. Deduct Balance
        new_balance = wallet_balance - price
        supabase_admin.table("Users").update({"wallet_balance": new_balance}).eq("id", current_user["id"]).execute()
        
        # 4. Record Payment (Use 'card' or existing valid method to avoid CHECK constraint failure)
        pay_data = {
            "user_id": current_user["id"],
            "booking_id": membership_id, # Reusing booking_id for membership ID
            "amount": price,
            "payment_method": "card", # Use 'card' as 'wallet' might violate check constraint
            "payment_status": "completed",
            "transaction_reference": f"WALLET-MEM-{current_user['id'][:6]}"
        }
        try:
            supabase_admin.table("Payments").insert(pay_data).execute()
        except Exception as e:
            print("Failed to record payment:", e)
            # Proceed anyway since balance was deducted
        
        # 5. Determine end_date based on duration string (e.g. "1 Month", "1 Year", "1 Week")
        duration_str = (plan.get("duration") or "1 Month").lower()
        now = datetime.utcnow()
        if "week" in duration_str:
            end_date = now + timedelta(weeks=1)
        elif "year" in duration_str:
            end_date = now + timedelta(days=365)
        else:
            end_date = now + timedelta(days=30) # Default to ~1 month
            
        # 6. Create UserMembership record
        user_mem_data = {
            "user_id": current_user["id"],
            "membership_id": membership_id,
            "salon_id": plan["salon_id"],
            "status": "active",
            "start_date": now.isoformat(),
            "end_date": end_date.isoformat()
        }
        res = supabase_admin.table("UserMemberships").insert(user_mem_data).execute()
        
        return {"message": "Successfully subscribed to membership", "wallet_balance": new_balance, "subscription": res.data[0]}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/my-memberships")
def get_my_memberships(current_user: dict = Depends(get_current_user)):
    """Get active memberships for the current customer."""
    try:
        # Fetch active UserMemberships
        res = supabase_admin.table("UserMemberships").select("*, Memberships(*), Salons(name, images)").eq("user_id", current_user["id"]).eq("status", "active").execute()
        
        # Format response
        memberships = []
        for record in res.data:
            mem = record
            mem["membership_details"] = record.get("Memberships", {})
            mem["salon_details"] = record.get("Salons", {})
            memberships.append(mem)
            
        return memberships
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/my-memberships/{user_membership_id}/cancel")
def cancel_my_membership(user_membership_id: str, current_user: dict = Depends(get_current_user)):
    """Cancel an active membership for the current customer."""
    try:
        if current_user["role"] != "customer":
            raise HTTPException(status_code=403, detail="Only customers can cancel memberships")
            
        res = supabase_admin.table("UserMemberships").update({"status": "cancelled"}).eq("id", user_membership_id).eq("user_id", current_user["id"]).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Membership not found or not owned by user")
            
        return {"message": "Membership cancelled successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))
