from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.services.supabase_db import supabase
from app.core.security import get_current_owner

router = APIRouter()

@router.get("/reports/performance")
def get_owner_performance(current_user: dict = Depends(get_current_owner)):
    try:
        # Get all salons owned by this owner
        salons_res = supabase.table("Salons").select("id, name, ai_aggregate_rating").eq("owner_id", current_user["id"]).execute()
        salons = salons_res.data
        if not salons:
            return {"total_earnings": 0, "appointments_count": 0, "salons": []}
            
        salon_ids = [s["id"] for s in salons]
        
        # Get all appointments for these salons
        appt_res = supabase.table("Appointments")\
            .select("id, user_id, status, payment_status, service_id, salon_id")\
            .in_("salon_id", salon_ids)\
            .execute()
        appointments = appt_res.data
        
        # Get all services for these salons to calculate prices
        services_res = supabase.table("Services")\
            .select("id, name, price")\
            .in_("salon_id", salon_ids)\
            .execute()
        services_map = {s["id"]: s for s in services_res.data}
        
        total_earnings = 0.0
        service_earnings = {}
        service_counts = {}
        unique_customers = set()
        status_counts = {"pending": 0, "confirmed": 0, "completed": 0, "cancelled": 0, "no-show": 0}
        
        for apt in appointments:
            if apt.get("user_id"):
                unique_customers.add(apt["user_id"])
                
            status = apt["status"]
            pay_status = apt["payment_status"]
            service_id = apt["service_id"]
            
            # Count status
            if status in status_counts:
                status_counts[status] += 1
                
            # If paid, add to earnings
            if pay_status == "paid":
                service = services_map.get(service_id)
                if service:
                    price = float(service["price"])
                    total_earnings += price
                    
                    s_name = service["name"]
                    service_earnings[s_name] = service_earnings.get(s_name, 0.0) + price
                    
            # Count popular services
            if service_id in services_map:
                s_name = services_map[service_id]["name"]
                service_counts[s_name] = service_counts.get(s_name, 0) + 1
                    
        return {
            "total_earnings": total_earnings,
            "appointments_count": len(appointments),
            "customer_count": len(unique_customers),
            "status_breakdown": status_counts,
            "earnings_by_service": service_earnings,
            "popular_services": dict(sorted(service_counts.items(), key=lambda item: item[1], reverse=True)[:5]),
            "salons": salons
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.services.gemini_service import get_chat_response

@router.get("/ai-insights")
def get_owner_ai_insights(current_user: dict = Depends(get_current_owner)):
    try:
        # Get all salons owned by this owner
        salons_res = supabase.table("Salons").select("id, name").eq("owner_id", current_user["id"]).execute()
        salons = salons_res.data
        if not salons:
            return {"insights": "No salon found. Create a salon first."}
            
        salon_ids = [s["id"] for s in salons]
        # Fetch reviews
        reviews_res = supabase.table("Reviews").select("rating, comment").in_("salon_id", salon_ids).execute()
        comments = [r["comment"] for r in reviews_res.data if r.get("comment")]
        
        if not comments:
            return {"insights": "Gather more reviews to generate business insights."}
            
        prompt = f"You are a business consultant for a salon owner. Based on these customer reviews: {comments}, give 2 actionable business insights/tips for the owner. Keep it under 100 words total."
        reply = get_chat_response(prompt)
        return {"insights": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
