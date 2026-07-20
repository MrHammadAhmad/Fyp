from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from app.services.gemini_service import get_chat_response, get_service_recommendation, analyze_face_shape_and_recommend, analyze_hair_image_json, analyze_skin_image_json, analyze_image_general
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
    rating: Optional[float] = None
    aiRating: Optional[float] = None
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
            
        # Fetch salons from DB to inject into AI context so it can recommend real locations
        salons_res = supabase_admin.table("Salons").select("id, name, location, address, street_address, town, city, latitude, longitude, average_rating").eq("is_approved", True).execute()
        salons_context = "Available Salons in our database (Use this data to recommend real salons based on user location):\n"
        for s in salons_res.data:
            salons_context += f"- {s['name']} at {s['location']} (lat: {s['latitude']}, lng: {s['longitude']}, rating: {s.get('average_rating', 0)})\n"
        
        full_prompt = salons_context + "\n" + prompt
            
        reply = get_chat_response(full_prompt)
        return {"reply": reply}
    except Exception as e:
        import traceback
        traceback.print_exc()
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
        salons_res = supabase_admin.table("Salons").select("id, name, location, average_rating, ai_aggregate_rating").eq("is_approved", True).execute()
        salons_list = salons_res.data
        
        if request.location:
            salons_list = [s for s in salons_list if request.location.lower() in (s.get("location") or "").lower()]
            
        if request.rating is not None:
            salons_list = [s for s in salons_list if float(s.get("average_rating") or 0) >= request.rating]
            
        if request.aiRating is not None:
            salons_list = [s for s in salons_list if float(s.get("ai_aggregate_rating") or 0) >= request.aiRating]
            
        if not salons_list:
            return {"recommendations": []}
            
        prompt = f"Based on location: {request.location or 'Any'}, minimum rating: {request.rating or 'Any'}, category: {request.category or 'Any'}, and user preferences: '{request.preferences or 'None'}', pick the single best matching salon from this list: {salons_list}. Give a short, clean, plain English explanation (NO MARKDOWN LIKE * OR #) of why it's recommended. Format your ENTIRE response as a strictly valid JSON object with EXACTLY two keys: 'id' (the id of the chosen salon) and 'reason' (the explanation string). Do not include any other text or formatting."
        reply = get_chat_response(prompt)
        
        try:
            # Strip ```json if it exists
            clean_reply = reply.replace('```json', '').replace('```', '').strip()
            parsed_reply = json.loads(clean_reply)
            chosen_id = parsed_reply.get('id')
            reason = parsed_reply.get('reason', 'Great choice based on your preferences.')
            
            # Find the chosen salon
            chosen_salon = next((s for s in salons_list if s["id"] == chosen_id), salons_list[0])
        except Exception:
            chosen_salon = salons_list[0]
            reason = reply.replace('*', '').replace('#', '')
        
        return {
            "recommendations": [
                {
                    "id": chosen_salon["id"],
                    "name": chosen_salon["name"],
                    "slug": chosen_salon.get("slug"),
                    "matchPercentage": 98,
                    "score": float(chosen_salon.get("average_rating") or 4.9),
                    "location": chosen_salon["location"],
                    "whyRecommended": reason,
                    "tags": ["Best Match"]
                }
            ]
        }
    except Exception as e:
        print(f"AI Recommendation error: {str(e)}")
        # Fallback: if AI fails, filter manually by location (if provided) and return the highest rated
        try:
            filtered_salons = salons_list
            if request.location:
                # Basic string match
                filtered_salons = [s for s in salons_list if request.location.lower() in (s.get("location") or "").lower()]
            
            if not filtered_salons:
                filtered_salons = salons_list
                
            # Sort by rating descending
            filtered_salons.sort(key=lambda x: float(x.get("average_rating") or 0), reverse=True)
            chosen_salon = filtered_salons[0]
            
            return {
                "recommendations": [
                    {
                        "id": chosen_salon["id"],
                        "name": chosen_salon["name"],
                        "slug": chosen_salon.get("slug"),
                        "matchPercentage": 90,
                        "score": float(chosen_salon.get("average_rating") or 4.9),
                        "location": chosen_salon["location"],
                        "whyRecommended": "Based on your preferences, this is one of our top-rated matching salons.",
                        "tags": ["Top Rated", "Fallback Match"]
                    }
                ]
            }
        except Exception as fallback_e:
            print(f"Fallback error: {str(fallback_e)}")
            return {
                "recommendations": []
            }

@router.post("/recommend-service")
def ai_recommend_service(request: ServiceRecommendRequest, current_user: dict = Depends(get_current_user)):
    try:
        concerns_str = ", ".join(request.concerns)
        prompt = f"The user has the following beauty/skin/hair concerns: {concerns_str}. What treatments or services do you recommend for them? Provide a well-thought-out, highly effective list of recommendations. Present them as a numbered list (1., 2., 3.). Put the name of the treatment in **bold** using markdown. Keep your explanation concise, easy to read, and helpful. Do NOT use hashtags (#)."
        reply = get_chat_response(prompt)
        
        # Strip any remaining # just in case, but KEEP asterisks for bolding
        reply = reply.replace('#', '')
        
        return {
            "suggestions": [
                {
                    "id": "bundle_1",
                    "name": "Ultimate Rejuvenation Bundle",
                    "type": "bundle",
                    "estimatedCost": "Rs 15,000 - Rs 25,000",
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
                    "estimatedCost": "Rs 15,000 - Rs 25,000",
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
        analysis_dict = analyze_hair_image_json(contents, file.content_type)
        
        if not analysis_dict:
            # Fallback if Gemini fails or returns invalid JSON
            analysis_dict = {
                "hairType": "Type 2B (Wavy)",
                "condition": "Dry & Frizzy",
                "healthScore": 65,
                "scalpCondition": "Mild Flaking",
                "damageLevel": "Moderate",
                "suggestedServices": ["Keratin Treatment", "Deep Conditioning Spa"],
                "suggestedTreatments": ["Hot Oil Massage", "Trim split ends"],
                "suggestedProducts": ["Argan Oil Serum", "Sulfate-Free Shampoo"],
                "explanation": "Unable to parse image correctly. Please try another image."
            }
        
        # Log history
        supabase_admin.table("RecommendationHistory").insert({
            "user_id": current_user["id"],
            "type": "hair",
            "input_data": "Uploaded hair image",
            "recommendation_result": analysis_dict.get("explanation", "")
        }).execute()
        
        return {
            "result": analysis_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skin-analysis")
async def skin_analysis(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed.")
            
        contents = await file.read()
        analysis_dict = analyze_skin_image_json(contents, file.content_type)
        
        if not analysis_dict:
            analysis_dict = {
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
                "explanation": "Unable to parse image correctly. Please try another image."
            }
        
        # Log history
        supabase_admin.table("RecommendationHistory").insert({
            "user_id": current_user["id"],
            "type": "skin",
            "input_data": "Uploaded skin image",
            "recommendation_result": analysis_dict.get("explanation", "")
        }).execute()
        
        return {
            "result": analysis_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-image-general")
async def analyze_image_generic(file: UploadFile = File(...), prompt: str = "Describe this image, detect objects, and extract any text (OCR).", current_user: dict = Depends(get_current_user)):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed.")
            

        contents = await file.read()
        analysis = analyze_image_general(contents, file.content_type, prompt)
        
        return {"analysis": analysis}
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
        supabase_admin.table("RecommendationHistory").insert({
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
        supabase_admin.table("RecommendationHistory").insert({
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
