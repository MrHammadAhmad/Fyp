import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.environ.get('SUPABASE_URL'), os.environ.get('SUPABASE_SERVICE_ROLE_KEY'))

res = supabase.table('Users').select('id, name, email').execute()
for user in res.data:
    if user.get('name') and ('Customer ' in user['name'] or 'Owner ' in user['name']):
        print(f"Deleting {user['name']}")
        supabase.table('Users').delete().eq('id', user['id']).execute()
print('Done!')
