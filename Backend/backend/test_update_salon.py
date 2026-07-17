import requests
from app.services.supabase_db import supabase_admin

salon_id = "e712114d-ce40-4bf6-9eab-96c1515ab1bd"

# directly use supabase admin to test
res = supabase_admin.table("Salons").update({
    "enable_online_booking": False,
    "allow_walkin_bookings": False
}).eq("id", salon_id).execute()

print("Update response:", res.data)

get_res = supabase_admin.table("Salons").select("*").eq("id", salon_id).execute()
print("Get response:", get_res.data[0]['enable_online_booking'], get_res.data[0]['allow_walkin_bookings'])
