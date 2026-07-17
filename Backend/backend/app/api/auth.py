from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.services.supabase_db import supabase, supabase_admin
from app.core.security import get_current_user
from app.schemas.user import UserProfileUpdate, ForgotPasswordRequest, ResetPasswordRequest

router = APIRouter()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str
    referred_by_code: Optional[str] = None
    role: Optional[str] = "customer"
    business_name: Optional[str] = None

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user: UserSignup):
    try:
        # Check if referrer code exists
        referred_by_id = None
        if user.referred_by_code:
            ref_res = supabase.table("Users").select("id").eq("referral_code", user.referred_by_code).execute()
            if ref_res.data:
                referred_by_id = ref_res.data[0]["id"]
                
        # Generate random unique referral code
        import random, string
        ref_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        from app.core.config import settings
        import resend
        
        # Call supabase admin api to generate signup link and register user without sending default email
        link_response = supabase_admin.auth.admin.generate_link({
            "type": "signup",
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {
                    "name": user.name,
                    "referral_code": ref_code,
                    "referred_by": referred_by_id
                },
                "redirect_to": "http://localhost:5173/auth/login"
            }
        })
        
        action_link = link_response.properties.action_link
        
        # Send confirmation email using Resend
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": user.email,
            "subject": "Verify Your Email - Beauty AI",
            "html": f"""
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #111; text-align: center;">Welcome to Beauty AI!</h2>
                    <p>Hi {user.name},</p>
                    <p>Thank you for registering. Please verify your email address to activate your account and start booking appointments.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{action_link}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Confirm Email</a>
                    </div>
                    <p style="color: #666; font-size: 13px;">If the button doesn't work, you can also copy and paste the link below into your browser:</p>
                    <p style="color: #888; font-size: 12px; word-break: break-all;">{action_link}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #999; font-size: 11px; text-align: center;">This is an automated email. Please do not reply.</p>
                </div>
            """
        })
        
        # Map frontend "business_owner" to backend database "owner"
        db_role = "customer"
        if user.role in ["business_owner", "owner"]:
            db_role = "owner"
        elif user.role == "admin":
            db_role = "admin"

        # Upsert profile into public.Users in case database triggers are not setup
        try:
            supabase_admin.table("Users").upsert({
                "id": link_response.user.id,
                "name": user.name,
                "email": user.email,
                "referral_code": ref_code,
                "referred_by": referred_by_id,
                "role": db_role
            }).execute()
        except Exception as db_err:
            print(f"Direct profile upsert failed: {str(db_err)}")
            
        # Create a Salon automatically if the user is a business owner/owner
        if db_role == "owner" and user.business_name:
            try:
                supabase.table("Salons").insert({
                    "name": user.business_name,
                    "location": "Update your address",
                    "owner_id": link_response.user.id,
                    "is_approved": True
                }).execute()
            except Exception as salon_err:
                print(f"Direct salon creation failed: {str(salon_err)}")

        return {"message": "Verification email sent. Please check your inbox.", "user": link_response.user}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(user: UserLogin):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        return {"access_token": response.session.access_token, "user": response.user}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    try:
        response = supabase.table("Users").select("*").eq("id", current_user["id"]).execute()
        if not response.data:
            # Self-healing: Create profile row if user exists in Supabase Auth but missing in public.Users
            try:
                auth_user_res = supabase_admin.auth.admin.get_user_by_id(current_user["id"])
                user_data = auth_user_res.user
                
                import random, string
                ref_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
                
                name = user_data.email.split("@")[0]
                role = "customer"
                if user_data.user_metadata:
                    name = user_data.user_metadata.get("name", name)
                    role = user_data.user_metadata.get("role", role)
                
                new_profile = {
                    "id": current_user["id"],
                    "name": name,
                    "email": user_data.email,
                    "referral_code": ref_code,
                    "role": role
                }
                supabase_admin.table("Users").upsert(new_profile).execute()
                return new_profile
            except Exception as healing_err:
                print(f"Self-healing profile creation failed: {str(healing_err)}")
                raise HTTPException(status_code=404, detail="User profile not found in database")
                
        return response.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/profile")
def update_profile(profile: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    try:
        update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields provided for update")
        
        response = supabase.table("Users").update(update_data).eq("id", current_user["id"]).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        return {"message": "Profile updated successfully", "profile": response.data[0]}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    try:
        # Supabase reset password trigger
        supabase.auth.reset_password_for_email(request.email)
        return {"message": "Password reset email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, current_user: dict = Depends(get_current_user)):
    try:
        # Update user password using current authenticated user's ID via admin client
        supabase_admin.auth.admin.update_user_by_id(
            current_user["id"],
            {"password": request.new_password}
        )
        return {"message": "Password has been reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

