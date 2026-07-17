import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.supabase_db import supabase_admin

def seed():
    # 1. Update Ali Zaib to pending
    ali_res = supabase_admin.table("Appointments").select("id").ilike("customer_name", "%ali zaib%").execute()
    for apt in ali_res.data:
        supabase_admin.table("Appointments").update({"status": "pending"}).eq("id", apt["id"]).execute()
        print(f"Updated Ali Zaib apt {apt['id']} to pending")

    # 2. Seed 3 appointments with Muslim names
    salon_res = supabase_admin.table("Salons").select("id, owner_id").limit(1).execute()
    if not salon_res.data:
        return
    salon_id = salon_res.data[0]["id"]
    user_id = salon_res.data[0]["owner_id"]
    
    service_res = supabase_admin.table("Services").select("id").eq("salon_id", salon_id).limit(1).execute()
    service_id = service_res.data[0]["id"] if service_res.data else None
    
    staff_res = supabase_admin.table("Staff").select("id").eq("salon_id", salon_id).limit(1).execute()
    staff_id = staff_res.data[0]["id"] if staff_res.data else None
    
    apts = [
        {
            "user_id": user_id,
            "salon_id": salon_id,
            "service_id": service_id,
            "staff_id": staff_id,
            "date": "2026-07-12",
            "time": "10:00:00",
            "booking_type": "walk-in",
            "status": "completed",
            "payment_status": "paid",
            "customer_name": "Fatima Zahra",
            "customer_phone": "+19871112222"
        },
        {
            "user_id": user_id,
            "salon_id": salon_id,
            "service_id": service_id,
            "staff_id": staff_id,
            "date": "2026-07-15",
            "time": "12:00:00",
            "booking_type": "walk-in",
            "status": "completed",
            "payment_status": "paid",
            "customer_name": "Omar Abdullah",
            "customer_phone": "+19873334444"
        },
        {
            "user_id": user_id,
            "salon_id": salon_id,
            "service_id": service_id,
            "staff_id": staff_id,
            "date": "2026-07-16",
            "time": "09:00:00",
            "booking_type": "walk-in",
            "status": "completed",
            "payment_status": "paid",
            "customer_name": "Ahmed Hassan",
            "customer_phone": "+19875556666"
        }
    ]
    
    res = supabase_admin.table("Appointments").insert(apts).execute()
    print("Inserted appointments:", [a["id"] for a in res.data])

if __name__ == "__main__":
    seed()
