import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

conn = psycopg2.connect(os.getenv("DIRECT_URL"))
cur = conn.cursor()
cur.execute("NOTIFY pgrst, 'reload schema';")
conn.commit()
cur.close()
conn.close()
print("Schema cache reloaded")
