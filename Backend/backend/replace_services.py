import os
import random
from dotenv import load_dotenv
load_dotenv()
from app.services.supabase_db import supabase_admin

def main():
    salons = supabase_admin.table("Salons").select("id").execute()
    salon_ids = [s["id"] for s in salons.data]
    
    for salon_id in salon_ids:
        print(f"Processing salon {salon_id}")
        
        # Insert new services
        new_services_data = [
            {"salon_id": salon_id, "name": "Haircut", "price": 30, "duration": 30},
            {"salon_id": salon_id, "name": "Styling", "price": 45, "duration": 45},
            {"salon_id": salon_id, "name": "Facial", "price": 50, "duration": 45},
            {"salon_id": salon_id, "name": "Skincare", "price": 60, "duration": 60},
            {"salon_id": salon_id, "name": "Beard", "price": 20, "duration": 20},
            {"salon_id": salon_id, "name": "Makeup", "price": 75, "duration": 60}
        ]
        
        res = supabase_admin.table("Services").insert(new_services_data).execute()
        new_services = res.data
        new_service_ids = [s["id"] for s in new_services]
        print(f"Inserted {len(new_services)} services.")
        
        # Get old appointments
        appts = supabase_admin.table("Appointments").select("id").eq("salon_id", salon_id).execute()
        
        # Update appointments to randomly use one of the new services
        for appt in appts.data:
            supabase_admin.table("Appointments").update(
                {"service_id": random.choice(new_service_ids)}
            ).eq("id", appt["id"]).execute()
            
        print("Updated appointments.")
        
if __name__ == "__main__":
    main()
