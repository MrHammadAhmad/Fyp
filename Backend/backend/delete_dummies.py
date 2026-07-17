import psycopg2
db_url = "postgresql://postgres.vqtznkbijsddadrlsais:matmLzGdGBbOPyDO@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
conn = psycopg2.connect(db_url)
cur = conn.cursor()

cur.execute('''DELETE FROM "Appointments" WHERE customer_name = 'John Doe' AND date IN ('2026-07-12', '2026-07-13', '2026-07-15')''')
conn.commit()

cur.close()
conn.close()
print("Dummy appointments deleted.")
