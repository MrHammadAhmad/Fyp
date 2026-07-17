from fastapi import APIRouter, Depends, HTTPException, status
from app.services.supabase_db import supabase, supabase_admin
from app.core.security import get_current_user
from typing import List

router = APIRouter()

@router.get("/")
def get_favorites(current_user: dict = Depends(get_current_user)):
    try:
        # Fetch favorites for user
        fav_res = supabase_admin.table("UserFavorites")\
            .select("salon_id")\
            .eq("user_id", current_user["id"])\
            .execute()
        
        if not fav_res.data:
            return []
            
        salon_ids = [f["salon_id"] for f in fav_res.data]
        
        # Fetch corresponding Salons
        salons_res = supabase_admin.table("Salons")\
            .select("*")\
            .in_("id", salon_ids)\
            .execute()
            
        return salons_res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{salon_id}")
def add_favorite(salon_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Verify salon exists
        salon_res = supabase_admin.table("Salons").select("id").eq("id", salon_id).execute()
        if not salon_res.data:
            raise HTTPException(status_code=404, detail="Salon not found")
            
        # Add to favorites
        data = {
            "user_id": current_user["id"],
            "salon_id": salon_id
        }
        res = supabase_admin.table("UserFavorites").insert(data).execute()
        return {"message": "Salon added to favorites", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{salon_id}")
def remove_favorite(salon_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Remove from favorites
        res = supabase_admin.table("UserFavorites")\
            .delete()\
            .eq("user_id", current_user["id"])\
            .eq("salon_id", salon_id)\
            .execute()
        return {"message": "Salon removed from favorites"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
