from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
from typing import List
from datetime import datetime

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_email(subject: str, recipients: List[str], body: str):
    try:
        message = MessageSchema(
            subject=subject,
            recipients=recipients,
            body=body,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"SUCCESS: Email sent to {recipients} | Subject: {subject}")
    except Exception as e:
        print(f"ERROR: Failed to send email to {recipients}")
        print(f"REASON: {str(e)}")

def get_html_template(title: str, content: str):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                background-color: #ffffff;
            }}
            .header {{
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 12px 12px 0 0;
            }}
            .content {{
                padding: 30px;
                color: #374151;
                line-height: 1.6;
            }}
            .footer {{
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #9ca3af;
                background-color: #f9fafb;
                border-radius: 0 0 12px 12px;
            }}
            .button {{
                display: inline-block;
                padding: 12px 24px;
                background-color: #3b82f6;
                color: white !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin-top: 20px;
            }}
            .highlight {{
                color: #1d4ed8;
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{title}</h1>
            </div>
            <div class="content">
                {content}
            </div>
            <div class="footer">
                &copy; {settings.MAIL_FROM_NAME} Flight Management System. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """

async def send_welcome_email(email: str):
    print(f"[BACKGROUND TASK STARTED] Preparing to send welcome email to {email}")
    content = f"""
    <p>Hello,</p>
    <p>Welcome to <span class="highlight">{settings.MAIL_FROM_NAME}</span>! We're thrilled to have you on board.</p>
    <p>Your account has been successfully created. You can now search for flights, book your next journey, and manage all your travel details in one place.</p>
    <p>Get started now by exploring our latest flight deals!</p>
    <a href="#" class="button">Explore Flights</a>
    """
    html = get_html_template("Welcome to SkyRoute!", content)
    await send_email(f"Welcome to {settings.MAIL_FROM_NAME}!", [email], html)

async def send_booking_confirmation_email(email: str, booking_details: dict):
    print(f"[BACKGROUND TASK STARTED] Preparing to send confirmation to {email}")
    content = f"""
    <p>Hello,</p>
    <p><span class="highlight">Congratulations!</span> Your booking has been successfully confirmed.</p>
    <p>We're excited to help you with your upcoming journey. Here are your booking details:</p>
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Type:</strong> {booking_details.get('type','N/A').capitalize()}</p>
        <p><strong>Reference ID:</strong> {booking_details.get('reference_id')}</p>
        <p><strong>Description:</strong> {booking_details.get('description')}</p>
        <p><strong>Seats:</strong> {booking_details.get('seats')}</p>
        <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Confirmed</span></p>
    </div>
    <p>Thank you for choosing {settings.MAIL_FROM_NAME}. Pack your bags and get ready!</p>
    <a href="#" class="button">View My Booking</a>
    """
    html = get_html_template("Booking Confirmed!", content)
    await send_email(f"Congratulations! Booking Confirmed: {booking_details.get('reference_id')}", [email], html)

async def send_cancellation_email(email: str, booking_id: int):
    content = f"""
    <p>Hello,</p>
    <p>We're confirming that your booking (ID: <span class="highlight">#{booking_id}</span>) has been <span class="highlight">successfully cancelled</span>.</p>
    <p>If you're eligible for a refund, it will be processed within 5-7 business days to your original payment method.</p>
    <p>We're sorry to see you go this time, but we hope to help you with your next trip soon!</p>
    <a href="#" class="button">Book a New Flight</a>
    """
    html = get_html_template("Booking Cancelled", content)
    await send_email(f"Cancellation Confirmation: Booking #{booking_id}", [email], html)
