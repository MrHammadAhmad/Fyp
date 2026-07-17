import sys
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.supabase_db import supabase_admin

def seed_reviews():
    salon_res = supabase_admin.table("Salons").select("id").limit(1).execute()
    if not salon_res.data:
        print("No salons found")
        return
    salon_id = salon_res.data[0]["id"]
    
    owner_res = supabase_admin.table("Users").select("id").eq("role", "admin").limit(1).execute()
    user_id = owner_res.data[0]["id"] if owner_res.data else None
    
    reviews = [
        (salon_id, user_id, 5, "Absolutely fantastic service! The staff was extremely professional and the environment was incredibly relaxing.", "Sarah Jenkins"),
        (salon_id, user_id, 5, "Best haircut I've ever had. Highly recommend this place to everyone.", "Michael Chang"),
        (salon_id, user_id, 4, "Great experience overall. Loved the attention to detail. Will definitely be coming back.", "Emily Rodriguez"),
        (salon_id, user_id, 5, "Such a beautiful salon! The stylists really know what they are doing. 10/10.", "David Smith"),
        (salon_id, user_id, 4, "Very good service. A bit pricey but worth the money for the quality you get.", "Jessica Lee"),
        (salon_id, user_id, 2, "Not what I expected. The wait time was too long even with an appointment.", "Robert Brown"),
        (salon_id, user_id, 1, "Terrible experience. The staff was rude and the place wasn't clean.", "Amanda White"),
        (salon_id, user_id, 2, "They rushed through my service and the result was very sloppy.", "John Davis"),
        (salon_id, user_id, 3, "It was just okay. Nothing special, but not terrible either.", "Olivia Miller"),
        (salon_id, user_id, 1, "Completely ruined my hair. I will never come back here again.", "Chris Wilson"),
    ]
    
    conn = psycopg2.connect(os.getenv("DIRECT_URL"))
    cur = conn.cursor()
    
    # ensure column exists
    try:
        cur.execute('ALTER TABLE "Reviews" ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);')
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Add column failed:", e)

    # empty table before seeding to avoid duplicates
    cur.execute('DELETE FROM "Reviews" WHERE salon_id = %s;', (salon_id,))
    
    cur.executemany("""
        INSERT INTO "Reviews" (salon_id, user_id, rating, comment, customer_name)
        VALUES (%s, %s, %s, %s, %s)
    """, reviews)
    conn.commit()
    
    cur.execute('SELECT AVG(rating), COUNT(*) FROM "Reviews" WHERE salon_id = %s', (salon_id,))
    row = cur.fetchone()
    avg_rating = float(row[0]) if row[0] else 0.0
    count = row[1]
    
    # Add reviewCount to Salons if it doesn't exist
    try:
        cur.execute('ALTER TABLE "Salons" ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER DEFAULT 0;')
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Failed to add reviewCount:", e)

    cur.execute('UPDATE "Salons" SET average_rating = %s, "reviewCount" = %s WHERE id = %s', (avg_rating, count, salon_id))
    conn.commit()
    
    cur.close()
    conn.close()
    print(f"Inserted 10 reviews for salon {salon_id} with new avg rating {avg_rating}")

if __name__ == "__main__":
    seed_reviews()
