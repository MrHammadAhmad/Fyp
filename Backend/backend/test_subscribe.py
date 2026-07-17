import os
from dotenv import load_dotenv
load_dotenv()
from app.services.supabase_db import supabase_admin
from app.api.memberships import subscribe_membership

def main():
    # 1. Get a customer
    users = supabase_admin.table('Users').select('*').eq('role', 'customer').limit(1).execute()
    if not users.data:
        print("No customers found")
        return
    customer = users.data[0]
    
    # 2. Get a membership plan
    plans = supabase_admin.table('Memberships').select('*').limit(1).execute()
    if not plans.data:
        print("No memberships found")
        return
    plan = plans.data[0]
    
    print(f"Subscribing {customer['email']} to {plan['name']}")
    
    # 3. Call subscribe_membership directly
    try:
        res = subscribe_membership(membership_id=plan['id'], current_user=customer)
        print("Success:", res)
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    main()
