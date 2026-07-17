from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.services.supabase_db import supabase, supabase_admin

security = HTTPBearer()

import time

_USER_CACHE = {}
CACHE_TTL = 300  # 5 minutes

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    now = time.time()
    
    # Check cache first to avoid rate limiting and speed up parallel requests
    if token in _USER_CACHE:
        cached_time, user_data = _USER_CACHE[token]
        if now - cached_time < CACHE_TTL:
            return user_data

    try:
        # Ask Supabase to verify the token and return the user
        response = supabase.auth.get_user(token)
        user = response.user
        if user is None:
            raise Exception("Invalid token or user not found")
            
        # Fetch the role, email and name from the public.Users table using the admin client (bypasses RLS)
        profile_res = supabase_admin.table("Users").select("role, email, name").eq("id", user.id).execute()
        
        role = "customer" # default fallback
        email = None
        name = None
        if profile_res.data:
            role = profile_res.data[0].get("role", "customer")
            email = profile_res.data[0].get("email")
            name = profile_res.data[0].get("name")
            
        user_data = {"id": user.id, "role": role, "email": email, "name": name}
        _USER_CACHE[token] = (now, user_data)
        
        return user_data
    except Exception as e:
        print(f"Token validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_owner(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Salon owner access required")
    return current_user

def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

def get_current_customer(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer access required")
    return current_user
