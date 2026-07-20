import sys
sys.path.append('.')
from app.services.supabase_db import supabase_admin

salons = supabase_admin.table('Salons').select('id').execute().data
for s in salons:
    reviews = supabase_admin.table('Reviews').select('ai_rating').eq('salon_id', s['id']).execute().data
    
    ai_ratings = [r['ai_rating'] for r in reviews if r.get('ai_rating') is not None]
    
    if ai_ratings:
        avg_ai = round(sum(ai_ratings) / len(ai_ratings), 1)
        supabase_admin.table('Salons').update({'ai_aggregate_rating': avg_ai}).eq('id', s['id']).execute()
        print(f"Updated salon {s['id']} with ai_aggregate_rating {avg_ai}")
    else:
        # If no AI ratings, set it to None or leave it. Let's leave it.
        pass
