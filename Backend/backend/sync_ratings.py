import sys
sys.path.append('.')
from app.services.supabase_db import supabase_admin

salons = supabase_admin.table('Salons').select('id').execute().data
for s in salons:
    reviews = supabase_admin.table('Reviews').select('rating').eq('salon_id', s['id']).execute().data
    if reviews:
        avg = sum(r['rating'] for r in reviews) / len(reviews)
        supabase_admin.table('Salons').update({'average_rating': avg}).eq('id', s['id']).execute()
        print(f"Updated {s['id']} with {avg}")
