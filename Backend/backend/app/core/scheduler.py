from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.services.supabase_db import supabase_admin
from app.services import email_service
from app.api.appointments import enrich_appointment_data
import datetime

def check_upcoming_appointments():
    """Background job to check for upcoming appointments and send email reminders."""
    try:
        now = datetime.datetime.now()
        today_str = now.strftime("%Y-%m-%d")
        
        # We fetch all appointments that are pending or confirmed for today or future dates
        # but realistically, just today and tomorrow is enough since 3 hours is close.
        # To be safe, we fetch where date >= today
        res = supabase_admin.table("Appointments")\
            .select("*")\
            .in_("status", ["pending", "confirmed"])\
            .gte("date", today_str)\
            .execute()
            
        appointments = res.data
        if not appointments:
            return
            
        for apt in appointments:
            # Skip if both reminders are already sent
            if apt.get("email_reminded_day") and apt.get("email_reminded_3h"):
                continue
                
            apt_date = str(apt["date"])
            apt_time = str(apt["time"])
            
            try:
                t_parts = apt_time.split(":")
                t_formatted = f"{t_parts[0].zfill(2)}:{t_parts[1].zfill(2)}:00"
                apt_dt = datetime.datetime.strptime(f"{apt_date} {t_formatted}", "%Y-%m-%d %H:%M:%S")
            except Exception:
                continue
                
            time_diff = apt_dt - now
            
            # If the appointment is in the past, skip
            if time_diff.total_seconds() < 0:
                continue
                
            # Fetch user email
            user_res = supabase_admin.table("Users").select("email, name").eq("id", apt["user_id"]).execute()
            if not user_res.data:
                continue
            
            customer_email = user_res.data[0].get("email")
            customer_name = user_res.data[0].get("name", "Customer")
            if not customer_email:
                continue
                
            enriched_apt = enrich_appointment_data(apt)
            
            # Check for "day of booking" reminder
            if not apt.get("email_reminded_day") and apt_date == today_str:
                # Send day reminder
                success = email_service.send_booking_reminder(customer_email, customer_name, enriched_apt, "day")
                if success:
                    supabase_admin.table("Appointments").update({"email_reminded_day": True}).eq("id", apt["id"]).execute()
                    
            # Check for "3 hours before" reminder
            # If time_diff is less than or equal to 3 hours (10800 seconds)
            if not apt.get("email_reminded_3h") and time_diff.total_seconds() <= 10800:
                # Send 3h reminder
                success = email_service.send_booking_reminder(customer_email, customer_name, enriched_apt, "3h")
                if success:
                    supabase_admin.table("Appointments").update({"email_reminded_3h": True}).eq("id", apt["id"]).execute()

    except Exception as e:
        print(f"Error in background scheduler: {e}")


def start_scheduler():
    scheduler = BackgroundScheduler()
    # Run every 10 minutes
    scheduler.add_job(
        check_upcoming_appointments,
        trigger=IntervalTrigger(minutes=10),
        id="check_upcoming_appointments_job",
        name="Check upcoming appointments for reminders",
        replace_existing=True,
    )
    scheduler.start()
    print("Started background scheduler for email notifications.")
    return scheduler
