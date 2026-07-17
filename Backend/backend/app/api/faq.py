from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from app.services.supabase_db import supabase
from app.core.security import get_current_admin

router = APIRouter()

class FAQCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = 'general'

class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None

@router.get("/")
def get_faqs(category: Optional[str] = None):
    try:
        query = supabase.table("FAQs").select("*")
        if category:
            query = query.eq("category", category)
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_faq(data: FAQCreate, current_user: dict = Depends(get_current_admin)):
    try:
        res = supabase.table("FAQs").insert(data.model_dump()).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{faq_id}")
def update_faq(faq_id: str, data: FAQUpdate, current_user: dict = Depends(get_current_admin)):
    try:
        check_res = supabase.table("FAQs").select("id").eq("id", faq_id).execute()
        if not check_res.data:
            raise HTTPException(status_code=404, detail="FAQ not found")
            
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields provided for update")
            
        res = supabase.table("FAQs").update(update_data).eq("id", faq_id).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{faq_id}")
def delete_faq(faq_id: str, current_user: dict = Depends(get_current_admin)):
    try:
        check_res = supabase.table("FAQs").select("id").eq("id", faq_id).execute()
        if not check_res.data:
            raise HTTPException(status_code=404, detail="FAQ not found")
            
        supabase.table("FAQs").delete().eq("id", faq_id).execute()
        return {"message": "FAQ deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))
