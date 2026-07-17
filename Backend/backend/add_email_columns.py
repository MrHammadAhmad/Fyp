import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

def run_migration():
    conn_str = os.getenv("DIRECT_URL")
    if not conn_str:
        print("Error: DIRECT_URL not found in .env")
        return
        
    try:
        conn = psycopg2.connect(conn_str)
        cur = conn.cursor()
        
        # Add email_reminded_day column
        cur.execute("""
        ALTER TABLE "Appointments"
        ADD COLUMN IF NOT EXISTS email_reminded_day BOOLEAN DEFAULT FALSE;
        """)
        
        # Add email_reminded_3h column
        cur.execute("""
        ALTER TABLE "Appointments"
        ADD COLUMN IF NOT EXISTS email_reminded_3h BOOLEAN DEFAULT FALSE;
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("Successfully added email reminder columns to Appointments table.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
