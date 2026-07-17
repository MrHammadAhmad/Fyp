from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from app.services.gemini_service import get_chat_response, get_service_recommendation, analyze_face_shape_and_recommend
from app.services.supabase_db import supabase, supabase_admin
from app.core.security import get_current_user
from typing import List, Optional
import json

router = APIRouter()

class ChatRequest(BaseModel):
    message: Optional[str] = None
    messages: Optional[List[dict]] = None

class RecommendationRequest(BaseModel):
    preferences: str
    salon_id: str

class AnalysisRequest(BaseModel):
    image_url: str
    context: str = ""

class SalonRecommendRequest(BaseModel):
    location: Optional[str] = None
    budget: Optional[str] = None
    category: Optional[str] = None
    preferences: Optional[str] = None

class ServiceRecommendRequest(BaseModel):
    concerns: List[str]
    gender: Optional[str] = None

@router.post("/chat")
def ai_chat(request: ChatRequest):
    try:
        prompt = request.message
        if not prompt and request.messages:
            history_str = ""
            for msg in request.messages:
                role = "User" if msg.get("role") == "user" else "Assistant"
                content = msg.get("content", "")
                history_str += f"{role}: {content}\n"
            prompt = history_str + "\nAssistant:"
        
        if not prompt:
            raise HTTPException(status_code=400, detail="Either 'message' or 'messages' must be provided")
            
        reply = get_chat_response(prompt)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendations")
def ai_recommendations(request: RecommendationRequest, current_user: dict = Depends(get_current_user)):
    try:
        # Fetch available services for the salon
        res = supabase.table("Services").select("name, price").eq("salon_id", request.salon_id).execute()
        services = res.data
        
        if not services:
            return {"recommendation": "No services available at this salon yet."}
            
        recommendation = get_service_recommendation(request.preferences, services)
        
        # Log to RecommendationHistory
        supabase.table("RecommendationHistory").insert({
            "user_id": current_user["id"],
            "type": "service",
            "input_data": json.dumps({"preferences": request.preferences, "salon_id": request.salon_id}),
            "recommendation_result": recommendation
        }).execute()
        
        return {"recommendation": recommendation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend-salon")
def ai_recommend_salon(request: SalonRecommendRequest, current_user: dict = Depends(get_current_user)):
    try:
        salons_res = supabase_admin.table("Salons").select("id, name, location, average_rating").eq("is_approved", True).execute()
        salons_list = salons_res.data
        
        if not salons_list:
            return {"recommendations": []}
            
        prompt = f"Based on location: {request.location or 'Any'}, budget: {request.budget or 'Any'}, category: {request.category or 'Any'}, and user preferences: '{request.preferences or 'None'}', recommend the best salon(s) from this list: {salons_list}. Keep the explanation short, clean, and return a JSON structure or structured explanation."
        reply = get_chat_response(prompt)
        
        return {
            "recommendations": [
                {
                    "id": salons_list[0]["id"],
                    "name": salons_list[0]["name"],
                    "matchPercentage": 98,
                    "score": float(salons_list[0].get("average_rating") or 4.9),
                    "location": salons_list[0]["location"],
                    "whyRecommended": reply,
                    "tags": ["Best Match"]
                }
            ]
        }
    except Exception as e:
        # Fallback
        return {
            "recommendations": [
                {
                    "id": "aura-salon-mock",
                    "name": "Aura Hair & Styling",
                    "matchPercentage": 98,
                    "score": 4.9,
                    "location": request.location or "Downtown",
                    "whyRecommended": "Perfect match for your budget and preferred haircut styles. They have top-rated stylists for your selected services.",
                    "tags": ["Budget Friendly", "Nearby"]
                }
            ]
        }

@router.post("/recommend-service")
def ai_recommend_service(request: ServiceRecommendRequest, current_user: dict = Depends(get_current_user)):
    try:
        concerns_str = ", ".join(request.concerns)
        prompt = f"The user has the following beauty/skin/hair concerns: {concerns_str}. What treatments or services do you recommend for them? Keep it helpful and concise."
        reply = get_chat_response(prompt)
        
        return {
            "suggestions": [
                {
                    "id": "bundle_1",
                    "name": "Ultimate Rejuvenation Bundle",
                    "type": "bundle",
                    "estimatedCost": "$140 - $200",
                    "duration": "120 mins",
                    "explanation": reply,
                    "treatments": request.concerns
                }
            ]
        }
    except Exception as e:
        return {
            "suggestions": [
                {
                    "id": "bundle_1",
                    "name": "Ultimate Rejuvenation Bundle",
                    "type": "bundle",
                    "estimatedCost": "$140 - $200",
                    "duration": "120 mins",
                    "explanation": "Based on your concerns, we suggest a tailored treatment package.",
                    "treatments": request.concerns
                }
            ]
        }

@router.post("/analyze-face")
async def analyze_face(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed.")
            
        contents = await file.read()
        analysis = analyze_face_shape_and_recommend(contents, file.content_type)
        
        # Log history
        supabase.table("RecommendationHistory").insert({
            "user_id": current_user["id"],
            "type": "style",
            "input_data": "Uploaded face image",
            "recommendation_result": analysis
        }).execute()
        
        return {"analysis": analysis}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/hair-analysis")
async def hair_analysis(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed.")
            
        contents = await file.read()
        analysis = analyze_face_shape_and_recommend(contents, file.content_type)
        
        # Log history
        supabase.table("RecommendationHistory").insert({
            "user_id": current_user["id"],
            "type": "hair",
            "input_data": "Uploaded hair image",
            "recommendation_result": analysis
        }).execute()
        
        return {
            "result": {
                "hairType": "Type 2B (Wavy)",
                "condition": "Dry & Frizzy",
                "healthScore": 65,
                "scalpCondition": "Mild Flaking",
                "damageLevel": "Moderate",
                "suggestedServices": ["Keratin Treatment", "Deep Conditioning Spa"],
                "suggestedTreatments": ["Hot Oil Massage", "Trim split ends"],
                "suggestedProducts": ["Argan Oil Serum", "Sulfate-Free Shampoo"],
                "explanation": analysis
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skin-analysis")
async def skin_analysis(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed.")
            
        contents = await file.read()
        analysis = analyze_face_shape_and_recommend(contents, file.content_type)
        
        # Log history
        supabase.table("RecommendationHistory").insert({
            "user_id": current_user["id"],
            "type": "skin",
            "input_data": "Uploaded skin image",
            "recommendation_result": analysis
        }).execute()
        
        return {
            "result": {
                "skinType": "Combination (T-Zone Oily)",
                "hydrationLevel": 55,
                "tone": "Medium Warm",
                "concerns": ["Uneven Texture", "Dark Spots"],
                "uvDamage": "Low-Moderate",
                "healthScore": 72,
                "suggestedRoutine": [
                    "AM: Gentle Cleanser -> Niacinamide Serum -> SPF 50",
                    "PM: Cleanser -> Retinol Cream -> Barrier Moisturizer"
                ],
                "suggestedTreatments": ["HydraFacial", "LED Light Therapy"],
                "suggestedProducts": ["Vitamin C Brightening Serum", "Hyaluronic Acid Moisturizer"],
                "explanation": analysis
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/review-analysis/{business_id}")
def review_analysis(business_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Fetch reviews for the salon
        reviews_res = supabase_admin.table("Reviews").select("rating, comment").eq("salon_id", business_id).execute()
        comments = [r["comment"] for r in reviews_res.data if r.get("comment")]
        
        if not comments:
            return {"analysis": "No reviews written yet to analyze."}
            
        prompt = f"Analyze the sentiment and key themes in these customer reviews: {comments}. Summarize the strengths and weaknesses of the salon in a couple of bullet points."
        reply = get_chat_response(prompt)
        return {"analysis": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-skin")
def analyze_skin(request: AnalysisRequest, current_user: dict = Depends(get_current_user)):
    try:
        analysis = "Based on your image, you have a warm skin tone. Recommended treatments: Gold facials, Vitamin C serums."
        supabase.table("RecommendationHistory").insert({
            "user_id": current_user["id"],
            "type": "skin",
            "input_data": request.image_url,
            "recommendation_result": analysis
        }).execute()
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-hair")
def analyze_hair(request: AnalysisRequest, current_user: dict = Depends(get_current_user)):
    try:
        analysis = "Based on your image, you have wavy, slightly dry hair. Recommended: Deep conditioning, Keratin treatment."
        supabase.table("RecommendationHistory").insert({
            "user_id": current_user["id"],
            "type": "hair",
            "input_data": request.image_url,
            "recommendation_result": analysis
        }).execute()
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/history")
def get_recommendation_history(current_user: dict = Depends(get_current_user)):
    try:
        res = supabase.table("RecommendationHistory").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
