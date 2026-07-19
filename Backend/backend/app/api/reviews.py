from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.supabase_db import supabase
from app.core.security import get_current_user
from app.services.gemini_service import analyze_review_sentiment

router = APIRouter()

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    try:
        data = review.model_dump()
        data["user_id"] = current_user["id"]
        
        # Calculate AI rating
        if data.get("comment"):
            ai_rating = analyze_review_sentiment(data["comment"])
            if ai_rating is not None:
                data["ai_rating"] = ai_rating

        response = supabase.table("Reviews").insert(data).execute()
        new_review = response.data[0]
        
        # Calculate new average ratings for the salon
        reviews_res = supabase.table("Reviews").select("rating, ai_rating").eq("salon_id", data["salon_id"]).execute()
        if reviews_res.data:
            avg_rating = sum(r["rating"] for r in reviews_res.data) / len(reviews_res.data)
            
            ai_ratings = [r["ai_rating"] for r in reviews_res.data if r.get("ai_rating") is not None]
            
            update_data = {"average_rating": avg_rating}
            if ai_ratings:
                avg_ai_rating = sum(ai_ratings) / len(ai_ratings)
                update_data["ai_aggregate_rating"] = round(avg_ai_rating, 1)
                
            supabase.table("Salons").update(update_data).eq("id", data["salon_id"]).execute()
            
        return new_review
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from typing import Optional

@router.get("/{salon_id}")
def get_reviews(salon_id: str):
    try:
        response = supabase.table("Reviews").select("*").eq("salon_id", salon_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
class ReviewReplyModel(BaseModel):
    reply: str

@router.put("/{review_id}/reply")
def reply_review(review_id: str, payload: ReviewReplyModel, current_user: dict = Depends(get_current_user)):
    try:
        # Check if owner
        review_res = supabase.table("Reviews").select("salon_id").eq("id", review_id).execute()
        if not review_res.data:
            raise HTTPException(status_code=404, detail="Review not found")
        
        salon_id = review_res.data[0]["salon_id"]
        salon_res = supabase.table("Salons").select("owner_id").eq("id", salon_id).execute()
        if not salon_res.data or salon_res.data[0]["owner_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to reply")
                
        res = supabase.table("Reviews").update({"owner_reply": payload.reply}).eq("id", review_id).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

from pydantic import BaseModel
from typing import Optional

class ServiceEvaluationCreate(BaseModel):
    appointment_id: str
    rating: int # 1 to 5
    feedback: Optional[str] = None

@router.post("/service", status_code=status.HTTP_201_CREATED)
def evaluate_service(evaluation: ServiceEvaluationCreate, current_user: dict = Depends(get_current_user)):
    try:
        # Verify appointment exists and belongs to user
        apt_res = supabase.table("Appointments").select("*").eq("id", evaluation.appointment_id).execute()
        if not apt_res.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
        appointment = apt_res.data[0]
        
        if appointment["user_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to evaluate this appointment")
                
        payload = evaluation.model_dump()
        payload["service_id"] = appointment["service_id"]
        
        res = supabase.table("ServiceEvaluations").insert(payload).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

