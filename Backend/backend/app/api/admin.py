from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from app.services.supabase_db import supabase, supabase_admin
from app.core.security import get_current_admin

router = APIRouter()

class SalonApprovalUpdate(BaseModel):
    is_approved: bool

class UserBlockUpdate(BaseModel):
    is_blocked: bool

@router.get("/salons")
def get_all_salons(is_approved: Optional[bool] = None, current_user: dict = Depends(get_current_admin)):
    try:
        query = supabase_admin.table("Salons").select("*")
        if is_approved is not None:
            query = query.eq("is_approved", is_approved)
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/salons/{salon_id}/approve")
def approve_salon(salon_id: str, approval: SalonApprovalUpdate, current_user: dict = Depends(get_current_admin)):
    try:
        # Check if salon exists
        salon_res = supabase_admin.table("Salons").select("*").eq("id", salon_id).execute()
        if not salon_res.data:
            raise HTTPException(status_code=404, detail="Salon not found")
            
        res = supabase_admin.table("Salons").update({"is_approved": approval.is_approved}).eq("id", salon_id).execute()
        
        # Notify owner of salon approval
        try:
            status_text = "approved" if approval.is_approved else "rejected/suspended"
            supabase_admin.table("Notifications").insert({
                "user_id": salon_res.data[0]["owner_id"],
                "title": f"Salon {status_text.capitalize()}",
                "message": f"Your salon '{salon_res.data[0]['name']}' has been {status_text} by the administrator."
            }).execute()
        except Exception as notify_err:
            print(f"Failed to create notification: {str(notify_err)}")
            
        return {"message": f"Salon approval status updated to {approval.is_approved}", "salon": res.data[0]}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/users")
def get_all_users(current_user: dict = Depends(get_current_admin)):
    try:
        response = supabase_admin.table("Users").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}/block")
def block_user(user_id: str, block: UserBlockUpdate, current_user: dict = Depends(get_current_admin)):
    try:
        # Check if user exists
        user_res = supabase_admin.table("Users").select("*").eq("id", user_id).execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        res = supabase_admin.table("Users").update({"is_blocked": block.is_blocked}).eq("id", user_id).execute()
        action_text = "blocked" if block.is_blocked else "unblocked"
        return {"message": f"User has been {action_text} successfully", "user": res.data[0]}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/reports/system")
def get_system_report(current_user: dict = Depends(get_current_admin)):
    try:
        # Get users breakdown and monthly trends
        users_res = supabase_admin.table("Users").select("role, created_at").execute()
        users = users_res.data
        roles_count = {"customer": 0, "owner": 0, "admin": 0}
        user_trends = {}
        for u in users:
            r = u.get("role", "customer")
            if r in roles_count:
                roles_count[r] += 1
            cat_time = u.get("created_at")
            if cat_time:
                month = cat_time[:7]  # YYYY-MM
                user_trends[month] = user_trends.get(month, 0) + 1
                
        # Get salons breakdown
        salons_res = supabase_admin.table("Salons").select("is_approved").execute()
        salons = salons_res.data
        salons_count = {"approved": 0, "pending": 0}
        for s in salons:
            if s.get("is_approved", False):
                salons_count["approved"] += 1
            else:
                salons_count["pending"] += 1
                
        # Get appointments breakdown
        appt_res = supabase_admin.table("Appointments").select("status, payment_status").execute()
        appts = appt_res.data
        appt_status = {"pending": 0, "confirmed": 0, "completed": 0, "cancelled": 0, "no-show": 0}
        for a in appts:
            s = a.get("status", "pending")
            if s in appt_status:
                appt_status[s] += 1
                
        # Get payments breakdown, total revenue, and monthly revenue trends
        pay_res = supabase_admin.table("Payments").select("amount, payment_status, created_at").execute()
        total_revenue = 0.0
        payment_status = {"pending": 0, "completed": 0, "failed": 0, "refunded": 0}
        revenue_trends = {}
        for p in pay_res.data:
            status_val = p.get("payment_status", "pending")
            amt = float(p.get("amount", 0.0))
            if status_val == "completed":
                total_revenue += amt
                cat_time = p.get("created_at")
                if cat_time:
                    month = cat_time[:7]  # YYYY-MM
                    revenue_trends[month] = revenue_trends.get(month, 0.0) + amt
            if status_val in payment_status:
                payment_status[status_val] += 1
                 
        # Get monthly appointments trends
        trends_res = supabase_admin.table("Appointments").select("date").execute()
        trends = {}
        for row in trends_res.data:
            dt = row.get("date")
            if dt:
                month = dt[:7] # YYYY-MM
                trends[month] = trends.get(month, 0) + 1
                 
        # Get support tickets breakdown
        tickets_res = supabase_admin.table("SupportTickets").select("status").execute()
        tickets = tickets_res.data
        tickets_count = {"open": 0, "resolved": 0}
        for t in tickets:
            s = t.get("status", "open")
            if s in tickets_count:
                tickets_count[s] += 1

        # Fetch recent activities dynamically
        recent_salons = supabase_admin.table("Salons").select("name, created_at").order("created_at", desc=True).limit(5).execute().data
        recent_users = supabase_admin.table("Users").select("name, created_at").order("created_at", desc=True).limit(5).execute().data
        
        activities = []
        for s in recent_salons:
            activities.append({
                "type": "registration",
                "text": f"New salon '{s.get('name')}' registered in database.",
                "time": s.get("created_at")
            })
        for u in recent_users:
            activities.append({
                "type": "user",
                "text": f"New user '{u.get('name')}' signed up.",
                "time": u.get("created_at")
            })
        activities.sort(key=lambda x: x["time"] or "", reverse=True)
                 
        return {
            "users": {
                "total": len(users),
                "breakdown": roles_count,
                "monthly_growth": user_trends
            },
            "salons": {
                "total": len(salons),
                "breakdown": salons_count
            },
            "appointments": {
                "total": len(appts),
                "status_breakdown": appt_status,
                "payment_breakdown": payment_status,
                "monthly_trends": trends,
                "total_revenue": total_revenue,
                "monthly_revenue": revenue_trends
            },
            "support_tickets": {
                "total": len(tickets),
                "breakdown": tickets_count
            },
            "recent_activities": activities[:10]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
