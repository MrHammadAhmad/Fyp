import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

def create_reviews_table():
    conn = psycopg2.connect(os.getenv("DIRECT_URL"))
    cur = conn.cursor()
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS "Reviews" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        salon_id UUID REFERENCES "Salons"(id) ON DELETE CASCADE,
        user_id UUID REFERENCES "Users"(id) ON DELETE CASCADE,
        customer_name VARCHAR(255),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        owner_reply TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """)
    conn.commit()
    cur.close()
    conn.close()
    print("Table Reviews created successfully.")

if __name__ == "__main__":
    create_reviews_table()
