import os
import sys
from dotenv import load_dotenv

# Load env vars
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase_admin: Client = create_client(url, key)

response = supabase_admin.table("Appointments").select("*").execute()
print(f"Total appointments: {len(response.data)}")

for apt in response.data:
    if not apt.get("customer_name"):
        user_id = apt.get("user_id")
        user_res = supabase_admin.table("Users").select("id, name, email").eq("id", user_id).execute()
        user_data = user_res.data[0] if user_res.data else None
        print(f"Apt ID: {apt['id']}, User ID: {user_id}, User Data: {user_data}")
