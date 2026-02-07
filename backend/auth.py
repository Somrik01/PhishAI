from datetime import datetime, timedelta
from jose import jwt, JWTError
from argon2 import PasswordHasher
from fastapi import Request, HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

ph = PasswordHasher()

# ---------------- PASSWORD ----------------

def hash_password(password: str):
    return ph.hash(password)

def verify_password(password: str, hash: str):
    try:
        return ph.verify(hash, password)
    except:
        return False

# ---------------- JWT ----------------

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    to_encode["sub"] = str(to_encode["sub"])
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ---------------- AUTH MIDDLEWARE ----------------

def get_current_user(request: Request):
    auth = request.headers.get("Authorization")

    if not auth:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        if not auth.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid auth format")

        token = auth.replace("Bearer ", "").strip()
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload["sub"])

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
