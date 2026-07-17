import psycopg2
db_url = "postgresql://postgres.vqtznkbijsddadrlsais:matmLzGdGBbOPyDO@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
conn = psycopg2.connect(db_url)
cur = conn.cursor()

cur.execute('''SELECT column_name FROM information_schema.columns WHERE table_name = 'Appointments' ''')
cols = cur.fetchall()
print("Appointments columns:", [c[0] for c in cols])

cur.close()
conn.close()
