import psycopg2
db_url = "postgresql://postgres.vqtznkbijsddadrlsais:matmLzGdGBbOPyDO@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
for t in cur.fetchall(): print(t[0])
cur.close()
conn.close()
