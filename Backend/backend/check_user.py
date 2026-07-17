import psycopg2
db_url = "postgresql://postgres.vqtznkbijsddadrlsais:matmLzGdGBbOPyDO@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
conn = psycopg2.connect(db_url)
cur = conn.cursor()

cur.execute('''SELECT id, email, role FROM "Users" WHERE email = 'theelvion@gmail.com' ''')
user = cur.fetchone()
print("User:", user)

cur.execute('''SELECT * FROM "Appointments"''')
apts = cur.fetchall()
print("Appointments:", apts)

cur.close()
conn.close()
