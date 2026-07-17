import psycopg2
db_url = "postgresql://postgres.vqtznkbijsddadrlsais:matmLzGdGBbOPyDO@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
conn = psycopg2.connect(db_url)
cur = conn.cursor()

cur.execute('''SELECT id FROM "Users" WHERE role = 'customer' LIMIT 1''')
customer = cur.fetchone()

if customer:
    cur.execute('''SELECT id FROM "Salons" LIMIT 1''')
    salon = cur.fetchone()
    
    cur.execute('''SELECT id FROM "Services" WHERE salon_id = %s LIMIT 1''', (salon[0],))
    service = cur.fetchone()
    
    if service:
        dummy = [
            ('2026-07-12', '10:00:00', 'completed'),
            ('2026-07-13', '14:30:00', 'completed'),
            ('2026-07-15', '09:15:00', 'completed')
        ]
        for d, t, s in dummy:
            cur.execute("""
                INSERT INTO "Appointments" (user_id, salon_id, service_id, date, time, status, created_at, customer_name, customer_phone, booking_type, payment_status)
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), 'John Doe', '555-1234', 'online', 'unpaid')
            """, (customer[0], salon[0], service[0], d, t, s))
        conn.commit()
        print("Seeded 3 dummy appointments for July 12, 13, and 15.")
    else:
        print("No service found")
else:
    print("No customer found")

cur.close()
conn.close()
