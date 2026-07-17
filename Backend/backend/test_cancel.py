import os
from dotenv import load_dotenv
load_dotenv()
from app.services.supabase_db import supabase_admin
from app.api.appointments import update_appointment_status
from app.schemas.appointment import AppointmentStatusUpdate

def main():
    # 1. Get a customer
    users = supabase_admin.table('Users').select('*').eq('role', 'customer').limit(1).execute()
    if not users.data:
        print("No customers found")
        return
    customer = users.data[0]
    
    # 2. Get an appointment for this customer
    apts = supabase_admin.table('Appointments').select('*').eq('user_id', customer['id']).neq('status', 'cancelled').limit(1).execute()
    if not apts.data:
        print("No appointments found")
        return
    apt = apts.data[0]
    
    print(f"Cancelling appointment {apt['id']} for {customer['email']}")
    
    # 3. Call update_appointment_status directly
    try:
        res = update_appointment_status(appointment_id=apt['id'], status_update=AppointmentStatusUpdate(status='cancelled'), current_user=customer)
        print("Success:", res)
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    main()
