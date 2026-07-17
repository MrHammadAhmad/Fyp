import psycopg2
import json

conn = psycopg2.connect("dbname=beauty_ai user=postgres password=postgres host=localhost")
cur = conn.cursor()

# Get customer
cur.execute("SELECT id FROM users WHERE role = 'customer' LIMIT 1")
customer = cur.fetchone()

if customer:
    cur.execute("SELECT id FROM salons LIMIT 1")
    salon = cur.fetchone()
    
    cur.execute("SELECT id, name, price, duration FROM services WHERE salon_id = %s LIMIT 1", (salon[0],))
    service = cur.fetchone()
    
    print("Customer:", customer[0])
    
    # Check existing appointments format
    cur.execute("SELECT date, time, status FROM appointments LIMIT 1")
    existing = cur.fetchone()
    print("Format:", existing)
    
    # Seed 3 dummy appointments
    if service:
        dummy = [
            ('2026-07-12', '10:00', 'pending'),
            ('2026-07-13', '14:30', 'confirmed'),
            ('2026-07-15', '09:15', 'pending')
        ]
        for d, t, s in dummy:
            cur.execute("""
                INSERT INTO appointments (customer_id, salon_id, service_id, date, time, status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """, (customer[0], salon[0], service[0], d, t, s))
        conn.commit()
        print("Seeded 3 dummy appointments")

cur.close()
conn.close()
