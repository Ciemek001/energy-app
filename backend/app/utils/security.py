from itsdangerous import URLSafeTimedSerializer
import os

serializer = URLSafeTimedSerializer(os.getenv("SECRET_KEY", "default_secret"))

def generate_verification_token(email: str):
    return serializer.dumps(email, salt="email-verification")

def verify_token(token: str, expiration: int = 3600):
    try:
        email = serializer.loads(token, salt="email-verification", max_age=expiration)
        return email
    except:
        return None