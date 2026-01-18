from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
import os

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

async def send_verification_email(email: EmailStr, token: str):
    verify_url = f"http://localhost:8000/users/verify/{token}"
    
    html = f"""
    <p>Dziękujemy za rejestrację w Energy App!</p>
    <p>Kliknij w poniższy link, aby aktywować konto:</p>
    <a href="{verify_url}">{verify_url}</a>
    <p>Link wygaśnie za godzinę.</p>
    """

    message = MessageSchema(
        subject="Energy App - Potwierdzenie rejestracji",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)