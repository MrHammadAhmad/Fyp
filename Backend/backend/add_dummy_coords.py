import asyncio
import os
import random
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def run():
    # Lahore coordinates
    base_lat = 31.5204
    base_lng = 74.3587

    # Get all salons
    res = supabase.table("Salons").select("id, name, latitude").execute()
    salons = res.data
    
    updated_count = 0
    for salon in salons:
        # Add random offset between -0.05 and 0.05 degrees (approx 5km)
        lat = base_lat + random.uniform(-0.05, 0.05)
        lng = base_lng + random.uniform(-0.05, 0.05)
        
        supabase.table("Salons").update({"latitude": lat, "longitude": lng}).eq("id", salon["id"]).execute()
        updated_count += 1
        print(f"Updated {salon['name']} with lat={lat:.4f}, lng={lng:.4f}")
        
    print(f"Successfully updated {updated_count} salons with dummy coordinates.")

if __name__ == "__main__":
    run()
