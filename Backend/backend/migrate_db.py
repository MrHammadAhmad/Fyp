import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('.env')

conn = psycopg2.connect(os.environ['DIRECT_URL'])
cur = conn.cursor()
cur.execute('ALTER TABLE "SupportTickets" ADD COLUMN IF NOT EXISTS admin_reply TEXT;')
conn.commit()
print('Migration successful')
