from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.services.supabase_db import supabase
from app.core.security import get_current_user, get_current_admin
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/")
def get_user_notifications(current_user: dict = Depends(get_current_user)):
    try:
        # Get existing notifications
        res = supabase.table("Notifications")\
            .select("*")\
            .eq("user_id", current_user["id"])\
            .order("created_at", desc=True)\
            .execute()
        notifications = res.data

        # Auto-generate notifications based on appointments
        res_apt = supabase.table("Appointments")\
            .select("*")\
            .eq("user_id", current_user["id"])\
            .in_("status", ["pending", "confirmed"])\
            .execute()
            
        now = datetime.now()
        new_notifications = []
        
        for apt in res_apt.data:
            apt_date_str = f"{apt.get('date')} {apt.get('time', '00:00')}"
            try:
                apt_time = datetime.strptime(apt_date_str, "%Y-%m-%d %H:%M")
                time_diff = apt_time - now
                
                # 1. Booking Confirmation Notification
                book_title = "Appointment Booked"
                book_msg = f"Your appointment for {apt.get('date')} at {apt.get('time')} is confirmed."
                has_book = any(n.get("title") == book_title and n.get("message") == book_msg for n in notifications)
                if not has_book and time_diff > timedelta(minutes=0):
                    new_notifications.append({
                        "user_id": current_user["id"],
                        "title": book_title,
                        "message": book_msg,
                        "type": "booking",
                        "is_read": False,
                        "created_at": apt.get("created_at", now.isoformat())
                    })
                
                # 2. 3-Hour Reminder
                if timedelta(minutes=0) < time_diff <= timedelta(hours=3):
                    rem_title = "Upcoming Appointment Reminder"
                    rem_msg = f"Your appointment is coming up in less than 3 hours at {apt.get('time')}!"
                    has_rem = any(n.get("title") == rem_title and n.get("message") == rem_msg for n in notifications)
                    if not has_rem:
                        new_notifications.append({
                            "user_id": current_user["id"],
                            "title": rem_title,
                            "message": rem_msg,
                            "type": "booking",
                            "is_read": False,
                            "created_at": now.isoformat()
                        })
            except Exception as e:
                pass
                
        if new_notifications:
            res_insert = supabase.table("Notifications").insert(new_notifications).execute()
            notifications.extend(res_insert.data)
            notifications.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        return notifications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{notification_id}/read")
def mark_notification_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Check ownership
        res_notif = supabase.table("Notifications").select("*").eq("id", notification_id).execute()
        if not res_notif.data:
            raise HTTPException(status_code=404, detail="Notification not found")
        notification = res_notif.data[0]
        
        if notification["user_id"] != current_user["id"]:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to read this notification")
                
        res = supabase.table("Notifications").update({"is_read": True}).eq("id", notification_id).execute()
        return {"message": "Notification marked as read", "notification": res.data[0]}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/trigger-reminders")
def trigger_reminders(current_user: dict = Depends(get_current_admin)):
    """
    Endpoint intended to be triggered by a cron job to send reminders
    for appointments happening within the next 24 hours.
    """
    try:
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Get confirmed appointments for tomorrow
        res = supabase.table("Appointments")\
            .select("id, user_id, time, salon_id")\
            .eq("date", tomorrow)\
            .eq("status", "confirmed")\
            .execute()
            
        appointments = res.data
        notifications_sent = 0
        
        for apt in appointments:
            if apt.get("user_id"):
                # Insert reminder notification
                supabase.table("Notifications").insert({
                    "user_id": apt["user_id"],
                    "title": "Appointment Reminder",
                    "message": f"You have an upcoming appointment tomorrow at {apt['time']}.",
                    "type": "reminder",
                    "status": "sent"
                }).execute()
                notifications_sent += 1
                
        return {"message": "Reminders triggered successfully", "sent_count": notifications_sent}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
