from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate
from app.services.supabase_db import supabase, supabase_admin
from app.core.security import get_current_owner, get_current_user

router = APIRouter()

@router.post("/{salon_id}", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(salon_id: str, service: ServiceCreate, current_user: dict = Depends(get_current_owner)):
    try:
        # Verify that the current_user actually owns the salon
        salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", salon_id).execute()
        if not salon_res.data or salon_res.data[0]["owner_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to add services to this salon")
        
        data = service.model_dump()
        data["salon_id"] = salon_id
        response = supabase_admin.table("Services").insert(data).execute()
        return response.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{salon_id}", response_model=List[ServiceResponse])
def get_services(salon_id: str):
    try:
        response = supabase.table("Services").select("*").eq("salon_id", salon_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(service_id: str, service: ServiceUpdate, current_user: dict = Depends(get_current_owner)):
    try:
        # Get the service to check its salon ownership
        service_res = supabase_admin.table("Services").select("*").eq("id", service_id).execute()
        if not service_res.data:
            raise HTTPException(status_code=404, detail="Service not found")
        existing_service = service_res.data[0]
        
        # Verify salon ownership
        salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", existing_service["salon_id"]).execute()
        if not salon_res.data or salon_res.data[0]["owner_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to modify services for this salon")
        
        update_data = {k: v for k, v in service.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields provided for update")
            
        res = supabase_admin.table("Services").update(update_data).eq("id", service_id).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{service_id}")
def delete_service(service_id: str, current_user: dict = Depends(get_current_owner)):
    try:
        # Get the service to check its salon ownership
        service_res = supabase_admin.table("Services").select("*").eq("id", service_id).execute()
        if not service_res.data:
            raise HTTPException(status_code=404, detail="Service not found")
        existing_service = service_res.data[0]
        
        # Verify salon ownership
        salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", existing_service["salon_id"]).execute()
        if not salon_res.data or salon_res.data[0]["owner_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to delete services for this salon")
                
        supabase_admin.table("Services").delete().eq("id", service_id).execute()
        return {"message": "Service deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

