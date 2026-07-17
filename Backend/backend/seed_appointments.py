import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.supabase_db import supabase_admin

def seed():
    # Get a salon
    salon_res = supabase_admin.table("Salons").select("id, owner_id").limit(1).execute()
    if not salon_res.data:
        print("No salons found")
        return
    salon_id = salon_res.data[0]["id"]
    user_id = salon_res.data[0]["owner_id"]
    
    # Get a service
    service_res = supabase_admin.table("Services").select("id").eq("salon_id", salon_id).limit(1).execute()
    if not service_res.data:
        print("No services found")
        return
    service_id = service_res.data[0]["id"]
    
    # Get a staff
    staff_res = supabase_admin.table("Staff").select("id").eq("salon_id", salon_id).limit(1).execute()
    staff_id = staff_res.data[0]["id"] if staff_res.data else None
    
    apts = [
        {
            "user_id": user_id,
            "salon_id": salon_id,
            "service_id": service_id,
            "staff_id": staff_id,
            "date": "2026-07-13",
            "time": "11:00:00",
            "booking_type": "walk-in",
            "status": "completed",
            "payment_status": "paid",
            "customer_name": "Alice Smith",
            "customer_phone": "+19876543210"
        },
        {
            "user_id": user_id,
            "salon_id": salon_id,
            "service_id": service_id,
            "staff_id": staff_id,
            "date": "2026-07-14",
            "time": "14:00:00",
            "booking_type": "walk-in",
            "status": "completed",
            "payment_status": "paid",
            "customer_name": "Bob Johnson",
            "customer_phone": "+19876543211"
        }
    ]
    
    res = supabase_admin.table("Appointments").insert(apts).execute()
    print("Inserted appointments:", [a["id"] for a in res.data])

if __name__ == "__main__":
    seed()
