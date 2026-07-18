import resend
from app.core.config import settings
import datetime

# Initialize the Resend client
resend.api_key = settings.RESEND_API_KEY
FROM_EMAIL = settings.RESEND_FROM_EMAIL

def send_email(to_email: str, subject: str, html_content: str):
    """Utility function to send an email via Resend."""
    try:
        if not resend.api_key or resend.api_key == "re_123456789":
            print(f"Skipping email to {to_email} because RESEND_API_KEY is not configured properly.")
            return False
            
        params = {
            "from": f"Salon Booking <{FROM_EMAIL}>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        
        email = resend.Emails.send(params)
        print(f"Email sent successfully to {to_email}. ID: {email.get('id', 'unknown')}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False

def format_time(time_str: str):
    try:
        t_obj = datetime.datetime.strptime(time_str, "%H:%M:%S")
        return t_obj.strftime("%I:%M %p")
    except:
        try:
            t_obj = datetime.datetime.strptime(time_str, "%H:%M")
            return t_obj.strftime("%I:%M %p")
        except:
            return time_str

def send_booking_confirmation(customer_email: str, customer_name: str, booking_details: dict):
    """Sends a booking confirmation email to the customer."""
    salon_name = booking_details.get("businessName", "Our Salon")
    service_name = booking_details.get("serviceName", "Service")
    date_str = booking_details.get("date", "")
    time_str = format_time(booking_details.get("time", ""))
    
    subject = f"Booking Confirmed: {service_name} at {salon_name}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaeb; border-radius: 8px;">
        <h2 style="color: #405742;">Booking Confirmation</h2>
        <p>Hi {customer_name},</p>
        <p>You have successfully booked a <strong>{service_name}</strong> at <strong>{salon_name}</strong>.</p>
        
        <div style="background-color: #f9f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Date:</strong> {date_str}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {time_str}</p>
        </div>
        
        <p>We look forward to seeing you!</p>
        <p style="color: #6b7280; font-size: 14px;">If you need to reschedule or cancel, please log in to your dashboard at <a href="https://fyp-iota-rust.vercel.app/" style="color: #405742;">https://fyp-iota-rust.vercel.app/</a>.</p>
    </div>
    """
    
    return send_email(customer_email, subject, html_content)


def send_owner_notification(owner_email: str, owner_name: str, booking_details: dict):
    """Sends a new booking notification email to the salon owner."""
    customer_name = booking_details.get("customerName", booking_details.get("customer_name", "A customer"))
    service_name = booking_details.get("serviceName", "Service")
    salon_name = booking_details.get("businessName", "Your Salon")
    date_str = booking_details.get("date", "")
    time_str = format_time(booking_details.get("time", ""))
    
    subject = f"New Booking: {customer_name} booked {service_name}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaeb; border-radius: 8px;">
        <h2 style="color: #405742;">New Booking Alert</h2>
        <p>Hi {owner_name},</p>
        <p>You have a new booking at <strong>{salon_name}</strong>!</p>
        
        <div style="background-color: #f9f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Customer:</strong> {customer_name}</p>
            <p style="margin: 5px 0;"><strong>Service:</strong> {service_name}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> {date_str}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {time_str}</p>
        </div>
        
        <p>Please check your admin dashboard at <a href="https://fyp-iota-rust.vercel.app/" style="color: #405742;">https://fyp-iota-rust.vercel.app/</a> for more details.</p>
    </div>
    """
    
    return send_email(owner_email, subject, html_content)


def send_booking_reminder(customer_email: str, customer_name: str, booking_details: dict, reminder_type: str):
    """
    Sends a reminder email to the customer. 
    reminder_type should be either "day" or "3h"
    """
    salon_name = booking_details.get("businessName", "Our Salon")
    service_name = booking_details.get("serviceName", "Service")
    time_str = format_time(booking_details.get("time", ""))
    
    if reminder_type == "day":
        subject = f"Reminder: Your appointment at {salon_name} is today!"
        time_text = f"today at {time_str}"
    else:
        subject = f"Upcoming Appointment: 3 hours until your booking at {salon_name}"
        time_text = f"at {time_str} (in about 3 hours)"
        
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaeb; border-radius: 8px;">
        <h2 style="color: #405742;">Appointment Reminder</h2>
        <p>Hi {customer_name},</p>
        <p>This is a quick reminder about your upcoming <strong>{service_name}</strong> appointment at <strong>{salon_name}</strong> {time_text}.</p>
        
        <p>Please aim to arrive 5-10 minutes early.</p>
        <p>We look forward to seeing you!</p>
        <p style="color: #6b7280; font-size: 14px;">View your booking details at <a href="https://fyp-iota-rust.vercel.app/" style="color: #405742;">https://fyp-iota-rust.vercel.app/</a>.</p>
    </div>
    """
    
    return send_email(customer_email, subject, html_content)
