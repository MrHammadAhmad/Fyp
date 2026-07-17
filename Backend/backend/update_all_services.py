import psycopg2
db_url = "postgresql://postgres.vqtznkbijsddadrlsais:matmLzGdGBbOPyDO@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
conn = psycopg2.connect(db_url)
cur = conn.cursor()

try:
    print("Deleting existing appointments...")
    cur.execute('DELETE FROM "Appointments"')
    
    print("Deleting existing services...")
    cur.execute('DELETE FROM "Services"')
    
    print("Fetching all salons...")
    cur.execute('SELECT id FROM "Salons"')
    salons = cur.fetchall()
    
    services_to_seed = [
        ("Haircut", 30.00, 30),
        ("Styling", 45.00, 45),
        ("Facial", 50.00, 45),
        ("Skincare", 60.00, 60),
        ("Beard", 20.00, 20),
        ("Makeup", 75.00, 60),
    ]
    
    print(f"Seeding services for {len(salons)} salons...")
    for salon in salons:
        salon_id = salon[0]
        for name, price, duration in services_to_seed:
            cur.execute("""
                INSERT INTO "Services" (salon_id, name, price, duration, created_at)
                VALUES (%s, %s, %s, %s, NOW())
            """, (salon_id, name, price, duration))
            
    print("Services seeded.")
    
    print("Re-seeding 3 dummy past appointments...")
    cur.execute('''SELECT id FROM "Users" WHERE role = 'customer' LIMIT 1''')
    customer = cur.fetchone()
    
    if customer and len(salons) > 0:
        salon_id = salons[0][0]
        cur.execute('''SELECT id FROM "Services" WHERE salon_id = %s AND name = 'Haircut' LIMIT 1''', (salon_id,))
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
                """, (customer[0], salon_id, service[0], d, t, s))
            print("Seeded 3 dummy appointments for July 12, 13, and 15.")

    conn.commit()
    print("All done successfully!")

except Exception as e:
    conn.rollback()
    print("Error:", e)
finally:
    cur.close()
    conn.close()
