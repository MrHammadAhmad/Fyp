from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.schemas.appointment import AppointmentCreate, AppointmentResponse, AppointmentStatusUpdate, AppointmentReschedule
from app.services.supabase_db import supabase_admin
from app.core.security import get_current_user, get_current_owner, get_current_customer
from app.services import email_service

from typing import List, Optional

router = APIRouter()

def check_appointment_overlap(salon_id: str, date_str: str, time_str: str, service_id: str, staff_id: Optional[str] = None, exclude_id: Optional[str] = None):
    # Fetch all active (non-cancelled) appointments for the salon on that day
    query = supabase_admin.table("Appointments")\
        .select("id, time, service_id, staff_id")\
        .eq("salon_id", salon_id)\
        .eq("date", date_str)\
        .neq("status", "cancelled")
    
    if exclude_id:
        query = query.neq("id", exclude_id)
        
    check_res = query.execute()
    if not check_res.data:
        return
        
    from datetime import datetime, timedelta
    
    new_apt_time = datetime.strptime(time_str, "%H:%M:%S" if ":" in time_str and len(time_str.split(":")) == 3 else "%H:%M")
    svc_res = supabase_admin.table("Services").select("duration").eq("id", service_id).execute()
    new_duration = svc_res.data[0]["duration"] if svc_res.data else 30
    new_apt_end = new_apt_time + timedelta(minutes=new_duration)
    
    overlapping_apts = []
    for apt in check_res.data:
        exist_time_str = apt["time"]
        exist_time = datetime.strptime(exist_time_str, "%H:%M:%S" if ":" in exist_time_str and len(exist_time_str.split(":")) == 3 else "%H:%M")
        exist_svc_res = supabase_admin.table("Services").select("duration").eq("id", apt["service_id"]).execute()
        exist_duration = exist_svc_res.data[0]["duration"] if exist_svc_res.data else 30
        exist_end = exist_time + timedelta(minutes=exist_duration)
        
        # Check overlap
        if new_apt_time < exist_end and new_apt_end > exist_time:
            overlapping_apts.append(apt)
            
    if not overlapping_apts:
        return
        
    # If a specific staff is requested
    if staff_id:
        # Check if that staff member is busy
        for apt in overlapping_apts:
            if apt.get("staff_id") == staff_id:
                raise HTTPException(status_code=400, detail="The selected stylist is already booked during this time slot.")
    else:
        # Check if ALL staff members are busy
        staff_res = supabase_admin.table("Staff").select("id").eq("salon_id", salon_id).execute()
        all_staff_ids = [s["id"] for s in staff_res.data] if staff_res.data else []
        
        if all_staff_ids:
            busy_staff_ids = {apt["staff_id"] for apt in overlapping_apts if apt.get("staff_id")}
            if len(busy_staff_ids) >= len(all_staff_ids):
                raise HTTPException(status_code=400, detail="All specialists are fully booked during this time slot.")
        else:
            raise HTTPException(status_code=400, detail="This time slot overlaps with an existing appointment.")


def enrich_appointment_data(apt: dict) -> dict:
    salon_res = supabase_admin.table("Salons").select("name, image_url").eq("id", apt["salon_id"]).execute()
    salon = salon_res.data[0] if salon_res.data else {}
    
    service_res = supabase_admin.table("Services").select("name, price, duration").eq("id", apt["service_id"]).execute()
    service = service_res.data[0] if service_res.data else {}
    
    staff = {}
    if apt.get("staff_id"):
        staff_res = supabase_admin.table("Staff").select("name").eq("id", apt["staff_id"]).execute()
        staff = staff_res.data[0] if staff_res.data else {}
        
    return {
        "id": apt["id"],
        "user_id": apt["user_id"],
        "salon_id": apt["salon_id"],
        "service_id": apt["service_id"],
        "date": apt["date"],
        "time": apt["time"],
        "booking_type": apt["booking_type"],
        "status": apt["status"],
        "payment_status": apt["payment_status"],
        "customer_name": apt.get("customer_name"),
        "customer_phone": apt.get("customer_phone"),
        "staff_id": apt.get("staff_id"),
        "notes": apt.get("notes"),
        "serviceName": service.get("name", "Unknown Service"),
        "businessName": salon.get("name", "Unknown Business"),
        "businessImage": salon.get("image_url") or "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500",
        "duration": service.get("duration", 30),
        "price": float(service.get("price", 0.0)) if service.get("price") is not None else 0.0,
        "staffName": staff.get("name"),
    }

def auto_complete_past_appointments(appointments: List[dict]):
    from datetime import datetime, timedelta
    now_dt = datetime.now()
    
    for apt in appointments:
        if apt["status"] in ["pending", "confirmed"]:
            try:
                apt_time_str = str(apt["time"])
                t_parts = apt_time_str.split(":")
                if len(t_parts) == 2:
                    t_formatted = f"{t_parts[0].zfill(2)}:{t_parts[1].zfill(2)}:00"
                else:
                    t_formatted = f"{t_parts[0].zfill(2)}:{t_parts[1].zfill(2)}:{t_parts[2].zfill(2)}"
                apt_dt = datetime.strptime(f"{apt['date']} {t_formatted}", "%Y-%m-%d %H:%M:%S")
                
                # 1 hour buffer
                if apt_dt + timedelta(hours=1) < now_dt:
                    apt["status"] = "completed"
                    supabase_admin.table("Appointments").update({"status": "completed"}).eq("id", apt["id"]).execute()
            except Exception as e:
                pass

@router.post("/", status_code=status.HTTP_201_CREATED)
def book_appointment(appointment: AppointmentCreate, current_user: dict = Depends(get_current_user)):
    try:
        data = appointment.model_dump()
        
        # Serialize date and time to strings for Supabase
        data["date"] = str(data["date"])
        data["time"] = str(data["time"])
        
        # If no user_id provided for walk-in, default to current_user
        if not data.get("user_id"):
            data["user_id"] = current_user["id"]
        
        # Validate that slot is not already booked
        # Enhancing this check to reject overlapping appointments (BK-06)
        check_appointment_overlap(
            salon_id=data["salon_id"],
            date_str=data["date"],
            time_str=data["time"],
            service_id=data["service_id"],
            staff_id=data.get("staff_id")
        )
            
        payment_method = data.pop("payment_method", "cash")
        payment_status = data.pop("payment_status", None)
        
        # Fetch price of service
        service_res = supabase_admin.table("Services").select("price").eq("id", data["service_id"]).execute()
        price = float(service_res.data[0]["price"]) if service_res.data else 0.0
        
        if payment_method == "wallet":
            # Fetch user's wallet balance
            user_res = supabase_admin.table("Users").select("wallet_balance").eq("id", data["user_id"]).execute()
            if not user_res.data:
                raise HTTPException(status_code=404, detail="User not found")
            wallet_balance = float(user_res.data[0]["wallet_balance"])
            
            if wallet_balance < price:
                raise HTTPException(status_code=400, detail="Insufficient wallet balance")
                
            # Deduct wallet balance
            new_balance = wallet_balance - price
            supabase_admin.table("Users").update({"wallet_balance": new_balance}).eq("id", data["user_id"]).execute()
            
            # Set appointment as confirmed and paid
            data["status"] = "confirmed"
            data["payment_status"] = "paid"
            
            # Insert appointment
            response = supabase_admin.table("Appointments").insert(data).execute()
            new_apt = response.data[0]
            
            # Log payment
            supabase_admin.table("Payments").insert({
                "booking_id": new_apt["id"],
                "user_id": data["user_id"],
                "amount": price,
                "payment_method": "online",
                "payment_status": "completed",
                "transaction_reference": f"wallet_{new_apt['id']}"
            }).execute()
            
            result = {"appointment": enrich_appointment_data(new_apt)}
            
        else: # cash
            data["status"] = "pending"
            data["payment_status"] = "paid" if payment_status == "paid" else "unpaid"
            
            response = supabase_admin.table("Appointments").insert(data).execute()
            new_apt = response.data[0]
            
            # Log cash payment
            supabase_admin.table("Payments").insert({
                "booking_id": new_apt["id"],
                "user_id": data["user_id"],
                "amount": price,
                "payment_method": "cash",
                "payment_status": "completed" if payment_status == "paid" else "pending"
            }).execute()
            
            result = {"appointment": enrich_appointment_data(new_apt)}
            
        # --- Email Notifications ---
        try:
            booking_details = result["appointment"]
            customer_email = current_user.get("email")
            customer_name = booking_details.get("customerName", "Customer")
            
            # Fetch owner's email
            salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", data["salon_id"]).execute()
            if salon_res.data:
                owner_id = salon_res.data[0]["owner_id"]
                owner_res = supabase_admin.table("Users").select("email, name").eq("id", owner_id).execute()
                if owner_res.data:
                    owner_email = owner_res.data[0].get("email")
                    owner_name = owner_res.data[0].get("name", "Salon Owner")
                    
                    if owner_email:
                        email_service.send_owner_notification(owner_email, owner_name, booking_details)
            
            if customer_email:
                email_service.send_booking_confirmation(customer_email, customer_name, booking_details)
        except Exception as email_err:
            print(f"Error sending instant emails: {email_err}")
        # ---------------------------
        
        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[AppointmentResponse])
def get_appointments(current_user: dict = Depends(get_current_user)):
    try:
        # Fetch appointments with joined Salon and Service details
        if current_user["role"] == "owner":
            salons = supabase_admin.table("Salons").select("id").eq("owner_id", current_user["id"]).execute()
            salon_ids = [s["id"] for s in salons.data]
            if not salon_ids:
                return []
            response = supabase_admin.table("Appointments")\
                .select("*, Salons(name, image_url), Services(name, price, duration), Staff(name)")\
                .in_("salon_id", salon_ids)\
                .execute()
        else:
            response = supabase_admin.table("Appointments")\
                .select("*, Salons(name, image_url), Services(name, price, duration), Staff(name)")\
                .eq("user_id", current_user["id"])\
                .execute()
            
        enriched_data = []
        
        # Fetch user details for online bookings
        user_ids = [apt["user_id"] for apt in response.data if apt.get("user_id")]
        users_map = {}
        if user_ids:
            users_res = supabase_admin.table("Users").select("id, name, email").in_("id", user_ids).execute()
            if users_res.data:
                users_map = {u["id"]: u for u in users_res.data}
        
        # Auto-complete past appointments (1 hr buffer)
        auto_complete_past_appointments(response.data)
        
        for apt in response.data:
            salon = apt.get("Salons") or {}
            service = apt.get("Services") or {}
            staff = apt.get("Staff") or {}
            
            enriched_data.append({
                "id": apt["id"],
                "user_id": apt["user_id"],
                "salon_id": apt["salon_id"],
                "service_id": apt["service_id"],
                "date": apt["date"],
                "time": apt["time"],
                "booking_type": apt["booking_type"],
                "status": apt["status"],
                "payment_status": apt["payment_status"],
                # Walk-in fields
                "customer_name": apt.get("customer_name"),
                "customer_phone": apt.get("customer_phone"),
                "notes": apt.get("notes"),
                "customerName": apt.get("customer_name") or users_map.get(apt["user_id"], {}).get("name") or "Unknown",
                "customerEmail": users_map.get(apt["user_id"], {}).get("email") or "",
                # Enriched relations
                "serviceName": service.get("name", "Unknown Service"),
                "businessName": salon.get("name", "Unknown Business"),
                "businessImage": salon.get("image_url") or "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500",
                "duration": service.get("duration", 30),
                "price": float(service.get("price", 0.0)),
                "staffName": staff.get("name"),
            })
            
            
        return enriched_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    try:
        response = supabase_admin.table("Appointments")\
            .select("*, Salons(name, image_url), Services(name, price, duration), Staff(name)")\
            .eq("id", appointment_id)\
            .execute()
            
        if not response.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        apt = response.data[0]
        
        # Auto-complete if in past
        auto_complete_past_appointments([apt])
        
        # Security check: User can only view their own appointments, or owner of the salon, or admin
        authorized = False
        if current_user["role"] == "admin":
            authorized = True
        elif current_user["role"] == "customer" and apt["user_id"] == current_user["id"]:
            authorized = True
        elif current_user["role"] == "owner":
            salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", apt["salon_id"]).execute()
            if salon_res.data and salon_res.data[0]["owner_id"] == current_user["id"]:
                authorized = True
                
        if not authorized:
            raise HTTPException(status_code=403, detail="Not authorized to view this appointment")
            
        salon = apt.get("Salons") or {}
        service = apt.get("Services") or {}
        staff = apt.get("Staff") or {}
        
        return {
            "id": apt["id"],
            "user_id": apt["user_id"],
            "salon_id": apt["salon_id"],
            "service_id": apt["service_id"],
            "date": apt["date"],
            "time": apt["time"],
            "booking_type": apt["booking_type"],
            "status": apt["status"],
            "payment_status": apt["payment_status"],
            "customer_name": apt.get("customer_name"),
            "customer_phone": apt.get("customer_phone"),
            "staff_id": apt.get("staff_id"),
            "notes": apt.get("notes"),
            "serviceName": service.get("name", "Unknown Service"),
            "businessName": salon.get("name", "Unknown Business"),
            "businessImage": salon.get("image_url") or "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500",
            "duration": service.get("duration", 30),
            "price": float(service.get("price", 0.0)),
            "staffName": staff.get("name"),
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(appointment_id: str, status_update: AppointmentStatusUpdate, current_user: dict = Depends(get_current_user)):
    try:
        new_status = status_update.status
        new_payment_status = status_update.payment_status
        
        if not new_status and not new_payment_status:
            raise HTTPException(status_code=400, detail="No status updates provided")
        
        # Get existing appointment
        apt_res = supabase_admin.table("Appointments").select("*").eq("id", appointment_id).execute()
        if not apt_res.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
        appointment = apt_res.data[0]
        
        # Auto-complete if past 1 hr buffer
        auto_complete_past_appointments([appointment])
        
        # Check if the appointment date/time is actually in the past
        from datetime import datetime, timedelta
        now_dt = datetime.now()
        is_past = False
        try:
            apt_time_str = str(appointment["time"])
            t_parts = apt_time_str.split(":")
            t_formatted = f"{t_parts[0].zfill(2)}:{t_parts[1].zfill(2)}:00" if len(t_parts) == 2 else f"{t_parts[0].zfill(2)}:{t_parts[1].zfill(2)}:{t_parts[2].zfill(2)}"
            apt_dt = datetime.strptime(f"{appointment['date']} {t_formatted}", "%Y-%m-%d %H:%M:%S")
            if apt_dt < now_dt:
                is_past = True
        except Exception:
            pass
            
        if appointment["status"] == "completed" and new_status in ["pending", "cancelled"] and is_past:
            raise HTTPException(status_code=400, detail="Cannot change status of a completed past appointment")
        
        # Check authorization
        authorized = False
        if current_user["role"] == "admin":
            authorized = True
        elif current_user["role"] == "owner":
            # Check if this owner owns the salon of the appointment
            salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", appointment["salon_id"]).execute()
            if salon_res.data and salon_res.data[0]["owner_id"] == current_user["id"]:
                authorized = True
        elif current_user["role"] == "customer":
            # Customer can only cancel their own appointment
            if appointment["user_id"] == current_user["id"]:
                if new_status and new_status != "cancelled":
                    raise HTTPException(
                        status_code=403, 
                        detail="Customers are only allowed to update status to 'cancelled'"
                    )
                if new_payment_status:
                    raise HTTPException(
                        status_code=403, 
                        detail="Customers cannot update payment status"
                    )
                authorized = True
                    
        if not authorized:
            raise HTTPException(
                status_code=403, 
                detail="You are not authorized to update the status of this appointment"
            )
            
        from datetime import datetime, timedelta
        
        # Check cancellation policy if the customer is the one cancelling
        if current_user["role"] == "customer" and new_status == "cancelled":
            salon_res = supabase_admin.table("Salons").select("cancellation_hours, cancellation_fee").eq("id", appointment["salon_id"]).execute()
            if salon_res.data:
                salon_settings = salon_res.data[0]
                cancel_hours = salon_settings.get("cancellation_hours", 24)
                if cancel_hours is not None:
                    try:
                        appt_time_str = str(appointment["time"])
                        if len(appt_time_str.split(":")) == 2:
                            appt_time_str += ":00"
                        apt_dt = datetime.strptime(f"{appointment['date']} {appt_time_str}", "%Y-%m-%d %H:%M:%S")
                        
                        if datetime.now() + timedelta(hours=cancel_hours) > apt_dt:
                            raise HTTPException(
                                status_code=400, 
                                detail=f"Appointments must be cancelled at least {cancel_hours} hours in advance."
                            )
                    except Exception as e:
                        if isinstance(e, HTTPException):
                            raise e
                        print(f"Error parsing date/time for cancellation: {e}")
        
        # Determine final statuses to save
        final_status = new_status if new_status else appointment["status"]
        final_payment_status = new_payment_status if new_payment_status else appointment["payment_status"]

        # Handle cancellation refund logic
        if final_status == "cancelled" and final_payment_status == "paid":
            # Just update payment_status in db to refunded
            final_payment_status = "refunded"
            
        # Update both statuses
        response = supabase_admin.table("Appointments").update({"status": final_status, "payment_status": final_payment_status}).eq("id", appointment_id).execute()
        
        # Also update payment log if it's marked as paid
        if new_payment_status == "paid":
            supabase_admin.table("Payments").update({"payment_status": "completed"}).eq("booking_id", appointment_id).execute()
            
        return enrich_appointment_data(response.data[0])
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{appointment_id}/reschedule", response_model=AppointmentResponse)
def reschedule_appointment(appointment_id: str, reschedule_data: AppointmentReschedule, current_user: dict = Depends(get_current_user)):
    try:
        # Get existing appointment
        apt_res = supabase_admin.table("Appointments").select("*").eq("id", appointment_id).execute()
        if not apt_res.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
        appointment = apt_res.data[0]
        
        # Check authorization (only customer who booked it or owner/admin)
        if appointment["user_id"] != current_user["id"] and current_user.get("role") not in ["admin", "owner"]:
            raise HTTPException(status_code=403, detail="Not authorized to reschedule this appointment")
            
        # Check if new slot is available
        check_appointment_overlap(
            salon_id=appointment["salon_id"],
            date_str=str(reschedule_data.date),
            time_str=str(reschedule_data.time),
            service_id=appointment["service_id"],
            staff_id=appointment.get("staff_id"),
            exclude_id=appointment_id
        )
                    
        # Update appointment
        res = supabase_admin.table("Appointments").update({
            "date": str(reschedule_data.date),
            "time": str(reschedule_data.time),
            "status": "pending" # Reset to pending upon reschedule
        }).eq("id", appointment_id).execute()
        
        return enrich_appointment_data(res.data[0])
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/cleanup")
def cleanup_appointments(current_user: dict = Depends(get_current_user)):
    try:
        from datetime import datetime
        now_dt = datetime.now()
        
        # Fetch all pending/confirmed appointments
        res = supabase_admin.table("Appointments")\
            .select("*")\
            .in_("status", ["pending", "confirmed"])\
            .execute()
            
        appointments = res.data
        updated_count = 0
        
        for apt in appointments:
            apt_date = apt["date"]
            apt_time = apt["time"]
            
            try:
                t_parts = apt_time.split(":")
                t_formatted = f"{t_parts[0].zfill(2)}:{t_parts[1].zfill(2)}:00"
                apt_dt = datetime.strptime(f"{apt_date} {t_formatted}", "%Y-%m-%d %H:%M:%S")
            except Exception:
                continue
                
            if apt_dt < now_dt:
                new_status = "completed" if apt["payment_status"] == "paid" else "no-show"
                supabase_admin.table("Appointments").update({"status": new_status}).eq("id", apt["id"]).execute()
                updated_count += 1
                
        return {"message": "Cleanup completed successfully", "updated_appointments_count": updated_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Check authorization (only owner/admin)
        apt_res = supabase_admin.table("Appointments").select("*").eq("id", appointment_id).execute()
        if not apt_res.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
        appointment = apt_res.data[0]
        
        authorized = False
        if current_user["role"] == "admin":
            authorized = True
        elif current_user["role"] == "owner":
            salon_res = supabase_admin.table("Salons").select("owner_id").eq("id", appointment["salon_id"]).execute()
            if salon_res.data and salon_res.data[0]["owner_id"] == current_user["id"]:
                authorized = True
                
        if not authorized:
            raise HTTPException(status_code=403, detail="Not authorized to delete this appointment")
            
        # Delete related payments first (foreign key constraint)
        supabase_admin.table("Payments").delete().eq("booking_id", appointment_id).execute()
        
        # Delete appointment
        supabase_admin.table("Appointments").delete().eq("id", appointment_id).execute()
        return {"message": "Appointment deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))
