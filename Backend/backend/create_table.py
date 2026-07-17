import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

def create_table():
    conn = psycopg2.connect(os.getenv("DIRECT_URL"))
    cur = conn.cursor()
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS "UserMemberships" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES "Users"(id) ON DELETE CASCADE,
        membership_id UUID REFERENCES "Memberships"(id) ON DELETE CASCADE,
        salon_id UUID REFERENCES "Salons"(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'active',
        start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        end_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """)
    conn.commit()
    cur.close()
    conn.close()
    print("Table UserMemberships created successfully.")

if __name__ == "__main__":
    create_table()
