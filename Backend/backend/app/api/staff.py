from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.schemas.staff import StaffCreate, StaffResponse, StaffUpdate
from app.services.supabase_db import supabase, supabase_admin
from app.core.security import get_current_user, get_current_owner

router = APIRouter()

@router.get("/", response_model=List[StaffResponse])
def get_staff(salon_id: Optional[str] = None):
    try:
        query = supabase.table("Staff").select("*")
        if salon_id:
            query = query.eq("salon_id", salon_id)
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
def create_staff(staff: StaffCreate, current_user: dict = Depends(get_current_owner)):
    try:
        # Validate that the salon belongs to the current user (owner)
        salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", staff.salon_id).execute()
        if not salon_res.data:
            raise HTTPException(status_code=404, detail="Salon not found")
            
        if salon_res.data[0]["owner_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to manage staff for this salon")
                
        res = supabase_admin.table("Staff").insert(staff.model_dump()).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{staff_id}", response_model=StaffResponse)
def update_staff(staff_id: str, staff_update: StaffUpdate, current_user: dict = Depends(get_current_owner)):
    try:
        # Fetch staff to get salon_id
        staff_res = supabase_admin.table("Staff").select("salon_id").eq("id", staff_id).execute()
        if not staff_res.data:
            raise HTTPException(status_code=404, detail="Staff member not found")
            
        salon_id = staff_res.data[0]["salon_id"]
        
        # Validate salon ownership
        salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", salon_id).execute()
        if not salon_res.data or salon_res.data[0]["owner_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to update staff for this salon")
                
        update_data = {k: v for k, v in staff_update.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields provided for update")
            
        res = supabase_admin.table("Staff").update(update_data).eq("id", staff_id).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{staff_id}")
def delete_staff(staff_id: str, current_user: dict = Depends(get_current_owner)):
    try:
        # Fetch staff to get salon_id
        staff_res = supabase_admin.table("Staff").select("salon_id").eq("id", staff_id).execute()
        if not staff_res.data:
            raise HTTPException(status_code=404, detail="Staff member not found")
            
        salon_id = staff_res.data[0]["salon_id"]
        
        # Validate salon ownership
        salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", salon_id).execute()
        if not salon_res.data or salon_res.data[0]["owner_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to delete staff for this salon")
                
        supabase_admin.table("Staff").delete().eq("id", staff_id).execute()
        return {"message": "Staff member deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))
