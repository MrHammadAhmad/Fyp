from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.schemas.salon import SalonCreate, SalonResponse, SalonUpdate
from app.services.supabase_db import supabase, supabase_admin
from app.core.security import get_current_user, get_current_owner

router = APIRouter()

@router.get("/", response_model=List[SalonResponse])
def get_salons(
    location: Optional[str] = None,
    q: Optional[str] = None,
    category: Optional[str] = None,
    min_rating: Optional[float] = None,
    price_max: Optional[float] = None
):
    try:
        query = supabase.table("Salons").select("*")
        if location:
            query = query.or_(f"location.ilike.%{location}%,city.ilike.%{location}%,country.ilike.%{location}%,town.ilike.%{location}%")
        
        response = query.execute()
        salons = response.data
        
        if not salons:
            return []
            
        filtered_salons = []
        for salon in salons:
            # 1. Keyword search (q)
            if q:
                services_res = supabase.table("Services").select("name").eq("salon_id", salon["id"]).execute()
                service_names = [s["name"].lower() for s in services_res.data]
                
                name_match = q.lower() in salon["name"].lower()
                desc_match = q.lower() in (salon.get("description") or "").lower()
                service_match = any(q.lower() in s_name for s_name in service_names)
                
                if not (name_match or desc_match or service_match):
                    continue

            # 2. Category search
            if category:
                services_res = supabase.table("Services").select("name").eq("salon_id", salon["id"]).execute()
                cat_lower = category.lower()
                keywords = [cat_lower]
                if cat_lower in ['haircut', 'hair']:
                    keywords = ['hair', 'cut', 'style', 'trim', 'keratin', 'color']
                elif cat_lower in ['facial', 'skincare']:
                    keywords = ['facial', 'skin', 'mask', 'acne', 'peel', 'glow']
                elif cat_lower == 'massage':
                    keywords = ['massage', 'spa', 'therapy', 'body']
                elif cat_lower == 'nails':
                    keywords = ['nail', 'mani', 'pedi', 'gel', 'acrylic']
                elif cat_lower == 'makeup':
                    keywords = ['makeup', 'make-up', 'bridal', 'lash', 'brow']
                
                service_match = any(
                    any(kw in s["name"].lower() for kw in keywords)
                    for s in services_res.data
                )
                if not service_match:
                    continue
            
            # 3. Price filter
            if price_max is not None:
                services_res = supabase.table("Services").select("price").eq("salon_id", salon["id"]).execute()
                if not services_res.data or not any(float(s["price"]) <= price_max for s in services_res.data):
                    continue
                    
            # 4. Rating filter
            if min_rating is not None:
                reviews_res = supabase.table("Reviews").select("rating").eq("salon_id", salon["id"]).execute()
                if not reviews_res.data:
                    if min_rating > 0:
                        continue
                else:
                    avg_rating = sum(r["rating"] for r in reviews_res.data) / len(reviews_res.data)
                    if avg_rating < min_rating:
                        continue
                        
            filtered_salons.append(salon)
            
        return filtered_salons
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=SalonResponse, status_code=status.HTTP_201_CREATED)
def create_salon(salon: SalonCreate, current_user: dict = Depends(get_current_owner)):
    try:
        data = salon.model_dump()
        data["owner_id"] = current_user["id"]
        data["is_approved"] = True
        response = supabase_admin.table("Salons").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/owner/my", response_model=List[SalonResponse])
def get_owner_salons(current_user: dict = Depends(get_current_owner)):
    try:
        res = supabase_admin.table("Salons").select("*").eq("owner_id", current_user["id"]).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{salon_id}", response_model=SalonResponse)
def get_salon(salon_id: str):
    try:
        response = supabase.table("Salons").select("*").eq("id", salon_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Salon not found")
            
        salon_data = response.data[0]
        
        # Fetch services
        services_res = supabase.table("Services").select("*").eq("salon_id", salon_id).execute()
        salon_data["services"] = services_res.data if services_res.data else []
        
        # Fetch reviews
        reviews_res = supabase.table("Reviews").select("rating").eq("salon_id", salon_id).execute()
        if reviews_res.data:
            total_rating = sum([r["rating"] for r in reviews_res.data])
            salon_data["review_count"] = len(reviews_res.data)
            salon_data["average_rating"] = round(total_rating / len(reviews_res.data), 1)
        else:
            salon_data["review_count"] = 0
            salon_data["average_rating"] = 0.0
            
        return salon_data
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{salon_id}", response_model=SalonResponse)
def update_salon(salon_id: str, salon_update: SalonUpdate, current_user: dict = Depends(get_current_owner)):
    try:
        # Check if salon exists and user is owner
        salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", salon_id).execute()
        if not salon_res.data:
            raise HTTPException(status_code=404, detail="Salon not found")
            
        if salon_res.data[0]["owner_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to update this salon")
                
        update_data = {k: v for k, v in salon_update.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields provided for update")
            
        res = supabase_admin.table("Salons").update(update_data).eq("id", salon_id).execute()
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{salon_id}/slots")
def get_available_slots(salon_id: str, date: str):
    try:
        import datetime
        import json
        
        # Check if salon exists and fetch opening hours
        salon_res = supabase.table("Salons").select("id, opening_hours").eq("id", salon_id).execute()
        if not salon_res.data:
            raise HTTPException(status_code=404, detail="Salon not found")
            
        salon_data = salon_res.data[0]
        
        # Parse date to get day of week
        dt = datetime.datetime.strptime(date, "%Y-%m-%d")
        day_name = dt.strftime("%A") # e.g. "Monday"
        
        # Fetch booked appointments on this date
        appt_res = supabase_admin.table("Appointments")\
            .select("time")\
            .eq("salon_id", salon_id)\
            .eq("date", date)\
            .neq("status", "cancelled")\
            .execute()
            
        booked = []
        for apt in appt_res.data:
            t_str = apt["time"]
            parts = t_str.split(":")
            if len(parts) >= 2:
                booked.append(f"{parts[0]}:{parts[1]}")
            else:
                booked.append(t_str)
                
        # Generate slots based on opening hours
        business_slots = []
        if salon_data.get("opening_hours"):
            try:
                hours = json.loads(salon_data["opening_hours"])
                day_hours = next((h for h in hours if h["day"] == day_name), None)
                if day_hours and not day_hours.get("closed"):
                    open_time = day_hours.get("open", "09:00")
                    close_time = day_hours.get("close", "18:00")
                    
                    # Convert to datetime for iteration
                    current = datetime.datetime.strptime(open_time, "%H:%M")
                    end = datetime.datetime.strptime(close_time, "%H:%M")
                    
                    while current < end:
                        business_slots.append(current.strftime("%H:%M"))
                        current += datetime.timedelta(minutes=60) # 60 min slots by default
            except Exception as e:
                print(f"Error parsing opening hours: {e}")
                # Fallback to standard hours if parsing fails
                business_slots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
        else:
            # Fallback to standard hours if no custom hours exist
            business_slots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

        available_slots = [slot for slot in business_slots if slot not in booked]
        
        return {
            "date": date,
            "booked_slots": booked,
            "available_slots": available_slots,
            "all_slots": business_slots # Frontend needs all slots to render the grid
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

