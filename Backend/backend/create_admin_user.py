import os
import sys

# Add the current folder to sys.path so we can import app modules
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.services.supabase_db import supabase_admin

ADMIN_EMAIL = "hammad@saloon.com"
ADMIN_PASSWORD = "QU*23WEIR6#$TYOP1%^&7890!@45()"

def seed_admin():
    print(f"Checking if user {ADMIN_EMAIL} already exists...")
    try:
        users = supabase_admin.auth.admin.list_users()
        existing_user = None
        for u in users:
            if u.email == ADMIN_EMAIL:
                existing_user = u
                break
                
        if existing_user:
            print(f"User exists. Deleting user with ID {existing_user.id} to reset password and role...")
            supabase_admin.auth.admin.delete_user(existing_user.id)
            # Also clean up public profile if exists
            supabase_admin.table("Users").delete().eq("id", existing_user.id).execute()
            print("Deleted successfully.")
            
        print("Creating admin user in Supabase Auth...")
        user_response = supabase_admin.auth.admin.create_user({
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "email_confirm": True,
            "user_metadata": {
                "role": "admin"
            }
        })
        
        user_id = user_response.user.id
        print(f"User created in Auth with ID: {user_id}")
        
        print("Creating admin user profile in public.Users table...")
        profile_data = {
            "id": user_id,
            "email": ADMIN_EMAIL,
            "name": "Hammad Admin",
            "role": "admin"
        }
        res = supabase_admin.table("Users").insert(profile_data).execute()
        print("Profile created successfully in public.Users!")
        print("Admin user seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding admin user: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    seed_admin()
