import os
import smtplib
from email.message import EmailMessage

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")

def send_reset_email(to_email: str, reset_link: str):
    if not SMTP_HOST:
        # Dev fallback: log instead of crashing when SMTP isn't configured
        print(f"[DEV] Password reset link for {to_email}: {reset_link}")
        return

    msg = EmailMessage()
    msg["Subject"] = "Reset your PhishAI password"
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg.set_content(f"Click to reset your password: {reset_link}")

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)