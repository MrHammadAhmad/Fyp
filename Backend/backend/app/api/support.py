from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from app.services.supabase_db import supabase
from app.core.security import get_current_admin
import jwt
from app.core.config import settings

router = APIRouter()

class TicketCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class TicketStatusUpdate(BaseModel):
    status: str # 'open' or 'resolved'

def get_optional_user(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    try:
        token = auth_header.split(" ")[1]
        response = supabase.auth.get_user(token)
        if response and response.user:
            return response.user.id
        return None
    except Exception:
        return None

@router.post("/tickets", status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: TicketCreate, user_id: Optional[str] = Depends(get_optional_user)):
    try:
        payload = ticket.model_dump()
        payload["user_id"] = user_id
        payload["status"] = "open"
        
        res = supabase.table("SupportTickets").insert(payload).execute()
        return {"message": "Support ticket created successfully", "ticket": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/tickets")
def get_tickets(status: Optional[str] = None, current_user: dict = Depends(get_current_admin)):
    try:
        query = supabase.table("SupportTickets").select("*")
        if status:
            query = query.eq("status", status)
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/tickets/{ticket_id}")
def update_ticket_status(ticket_id: str, update: TicketStatusUpdate, current_user: dict = Depends(get_current_admin)):
    try:
        # Check ticket exists
        ticket_res = supabase.table("SupportTickets").select("*").eq("id", ticket_id).execute()
        if not ticket_res.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
            
        res = supabase.table("SupportTickets").update({"status": update.status}).eq("id", ticket_id).execute()
        return {"message": f"Ticket status updated to {update.status}", "ticket": res.data[0]}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))
