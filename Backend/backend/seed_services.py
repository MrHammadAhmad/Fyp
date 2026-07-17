import os
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.services.supabase_db import supabase_admin

SERVICES = [
    {"name": "Haircut",   "price": 15.00, "duration": 30},
    {"name": "Styling",   "price": 20.00, "duration": 45},
    {"name": "Facial",    "price": 25.00, "duration": 60},
    {"name": "Skincare",  "price": 30.00, "duration": 60},
    {"name": "Beard",     "price": 10.00, "duration": 20},
    {"name": "Makeup",    "price": 35.00, "duration": 75},
]

def seed():
    # Fetch all salons
    salons_res = supabase_admin.table("Salons").select("id, name, owner_id").execute()
    if not salons_res.data:
        print("ERROR: No salons found in the database. Please create a salon first.")
        sys.exit(1)

    print("Available salons:")
    for i, s in enumerate(salons_res.data):
        print(f"  [{i}] {s['name']} (id: {s['id']})")

    # Use first salon by default
    salon = salons_res.data[0]
    print(f"\nUsing salon: {salon['name']} ({salon['id']})")

    # Check which services already exist to avoid duplicates
    existing_res = supabase_admin.table("Services").select("name").eq("salon_id", salon["id"]).execute()
    existing_names = {s["name"] for s in existing_res.data}

    inserted = 0
    skipped = 0
    for svc in SERVICES:
        if svc["name"] in existing_names:
            print(f"  SKIP: '{svc['name']}' already exists")
            skipped += 1
            continue

        payload = {**svc, "salon_id": salon["id"]}
        supabase_admin.table("Services").insert(payload).execute()
        print(f"  ADDED: '{svc['name']}' - Price: {svc['price']} / Duration: {svc['duration']} min")
        inserted += 1

    print(f"\nDone! {inserted} services added, {skipped} skipped.")

if __name__ == "__main__":
    seed()
