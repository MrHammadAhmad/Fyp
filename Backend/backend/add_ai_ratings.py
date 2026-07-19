import os
import sys
from dotenv import load_dotenv

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from supabase import create_client, Client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.")
    sys.exit(1)

supabase_admin: Client = create_client(url, key)

from app.services.gemini_service import analyze_review_sentiment

def main():
    print("Starting migration...")
    
    import psycopg2
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        print("Executing schema alteration...")
        if "?pgbouncer=true" in db_url:
            db_url = db_url.replace("?pgbouncer=true", "")
        if "&pgbouncer=true" in db_url:
            db_url = db_url.replace("&pgbouncer=true", "")
        try:
            conn = psycopg2.connect(db_url)
            cur = conn.cursor()
            cur.execute('ALTER TABLE public."Reviews" ADD COLUMN IF NOT EXISTS ai_rating INTEGER;')
            cur.execute('ALTER TABLE public."Salons" ADD COLUMN IF NOT EXISTS ai_aggregate_rating NUMERIC;')
            cur.execute("NOTIFY pgrst, 'reload schema';")
            conn.commit()
            cur.close()
            conn.close()
            print("Schema updated successfully. Waiting a moment for schema cache to reload...")
            import time
            time.sleep(3)
        except Exception as e:
            print("Failed to alter schema:", e)
    else:
        print("DATABASE_URL not found. Attempting via supabase REST / SQL if possible, else skipping table modification.")

    # Now, backfill ai_rating for reviews
    print("Fetching existing reviews...")
    reviews_res = supabase_admin.table("Reviews").select("*").execute()
    reviews = reviews_res.data
    
    salons_to_update = set()
    
    for review in reviews:
        if review.get('comment'):
            print(f"Analyzing review {review['id']}...")
            ai_rating = analyze_review_sentiment(review['comment'])
            if ai_rating is not None:
                supabase_admin.table("Reviews").update({"ai_rating": ai_rating}).eq("id", review['id']).execute()
                print(f"Set ai_rating to {ai_rating} for review {review['id']}")
                salons_to_update.add(review['salon_id'])
        else:
            print(f"Skipping review {review['id']} (no comment)")
                
    # Now, update ai_aggregate_rating for salons
    for salon_id in salons_to_update:
        print(f"Updating aggregate for salon {salon_id}...")
        salon_reviews_res = supabase_admin.table("Reviews").select("ai_rating").eq("salon_id", salon_id).execute()
        ai_ratings = [r['ai_rating'] for r in salon_reviews_res.data if r.get('ai_rating') is not None]
        
        if ai_ratings:
            avg_rating = sum(ai_ratings) / len(ai_ratings)
            avg_rating = round(avg_rating, 1)
            supabase_admin.table("Salons").update({"ai_aggregate_rating": avg_rating}).eq("id", salon_id).execute()
            print(f"Set ai_aggregate_rating to {avg_rating} for salon {salon_id}")

    print("Migration completed successfully.")

if __name__ == "__main__":
    main()
