import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def clean_reviews():
    try:
        conn = psycopg2.connect(os.getenv("DIRECT_URL"))
        cur = conn.cursor()
        
        dummy_names = [
            "Sarah Jenkins",
            "Michael Chang",
            "Emily Rodriguez",
            "David Smith",
            "Jessica Lee",
            "Robert Brown",
            "Amanda White",
            "John Davis",
            "Olivia Miller",
            "Chris Wilson"
        ]
        
        # Delete reviews with dummy names
        query = 'DELETE FROM "Reviews" WHERE customer_name = ANY(%s) RETURNING salon_id;'
        cur.execute(query, (dummy_names,))
        deleted_rows = cur.fetchall()
        
        salon_ids = set([row[0] for row in deleted_rows])
        
        # Recalculate average ratings for affected salons
        for salon_id in salon_ids:
            cur.execute('SELECT AVG(rating), COUNT(*) FROM "Reviews" WHERE salon_id = %s', (salon_id,))
            row = cur.fetchone()
            avg_rating = float(row[0]) if row[0] else 0.0
            count = row[1]
            
            cur.execute('UPDATE "Salons" SET average_rating = %s WHERE id = %s', (avg_rating, salon_id))
            
        conn.commit()
        print(f"Deleted {len(deleted_rows)} dummy reviews.")
        print(f"Updated ratings for {len(salon_ids)} salons.")
        
    except Exception as e:
        print(f"Error: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    clean_reviews()
