from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.services.supabase_db import supabase
from app.core.security import get_current_owner, get_current_user

router = APIRouter()

class AnnouncementCreate(BaseModel):
    salon_id: str
    title: str
    description: str
    discount_percentage: Optional[float] = None
    valid_until: Optional[datetime] = None

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    discount_percentage: Optional[float] = None
    valid_until: Optional[datetime] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_announcement(data: AnnouncementCreate, current_user: dict = Depends(get_current_owner)):
    try:
        # Verify salon ownership
        salon_res = supabase.table("Salons").select("owner_id").eq("id", data.salon_id).execute()
        if not salon_res.data or salon_res.data[0]["owner_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to post announcements for this salon")
                
        payload = data.model_dump()
        if payload["valid_until"]:
            payload["valid_until"] = payload["valid_until"].isoformat()
            
        res = supabase.table("Announcements").insert(payload).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def get_announcements(salon_id: Optional[str] = None):
    try:
        query = supabase.table("Announcements").select("*")
        if salon_id:
            query = query.eq("salon_id", salon_id)
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{announcement_id}")
def update_announcement(announcement_id: str, data: AnnouncementUpdate, current_user: dict = Depends(get_current_owner)):
    try:
        # Get announcement
        ann_res = supabase.table("Announcements").select("*").eq("id", announcement_id).execute()
        if not ann_res.data:
            raise HTTPException(status_code=404, detail="Announcement not found")
        announcement = ann_res.data[0]
        
        # Verify ownership
        salon_res = supabase.table("Salons").select("owner_id").eq("id", announcement["salon_id"]).execute()
        if not salon_res.data or salon_res.data[0]["owner_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to modify this announcement")
                
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields provided for update")
            
        if "valid_until" in update_data and update_data["valid_until"]:
            update_data["valid_until"] = update_data["valid_until"].isoformat()
            
        res = supabase.table("Announcements").update(update_data).eq("id", announcement_id).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{announcement_id}")
def delete_announcement(announcement_id: str, current_user: dict = Depends(get_current_owner)):
    try:
        # Get announcement
        ann_res = supabase.table("Announcements").select("*").eq("id", announcement_id).execute()
        if not ann_res.data:
            raise HTTPException(status_code=404, detail="Announcement not found")
        announcement = ann_res.data[0]
        
        # Verify ownership
        salon_res = supabase.table("Salons").select("owner_id").eq("id", announcement["salon_id"]).execute()
        if not salon_res.data or salon_res.data[0]["owner_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to delete this announcement")
                
        supabase.table("Announcements").delete().eq("id", announcement_id).execute()
        return {"message": "Announcement deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))
