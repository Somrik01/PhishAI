from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.explain import generate_explanation
from core.predictor import predict_url
from core.rules import analyze_rules
from utils.url_features import extract_features
from db import init_db, db_session
from auth import GOOGLE_CLIENT_ID
from google.oauth2 import id_token
from google.auth.transport import requests
from models import UserCreate, UserLogin, ChangePasswordRequest
from models import UserCreate, UserLogin
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from utils.email import send_reset_email
import secrets
import sqlite3
import uuid
from datetime import timedelta
import json
from datetime import datetime

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# ----------------------------------
# App Init
# ----------------------------------
app = FastAPI(
    title="PhishAI Backend",
    description="SOC-style Phishing Detection API",
    version="2.0"
)

# Rate limiter — must come AFTER app is created
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

init_db()

# ----------------------------------
# CORS
# ----------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://phish-ai-delta.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------
# Schemas
# ----------------------------------
class ScanRequest(BaseModel):
    url: str

# ----------------------------------
# Root
# ----------------------------------
@app.get("/")
def root():
    return {"status": "PhishAI backend running 🚀"}

# ----------------------------------
# GET CURRENT USER
# ----------------------------------
@app.get("/auth/me")
def get_me(user_id=Depends(get_current_user)):
    with db_session() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, username FROM users WHERE id=?", (user_id,))
        user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return dict(user)

# ----------------------------------
# AUTH
# ----------------------------------
from fastapi import Request  # add Request to your existing fastapi import

@app.post("/auth/login")
@limiter.limit("5/minute")
def login(request: Request, user: UserLogin):
    ...

@app.post("/auth/register")
@limiter.limit("5/minute")
def register(request: Request, user: UserCreate):
    ...

@app.post("/auth/forgot-password")
@limiter.limit("3/minute")
def forgot_password(request: Request, data: dict):
    ...

@app.post("/auth/register")
@limiter.limit("5/minute")
def register(request: Request, user: UserCreate):
    try:
        with db_session() as conn:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                (user.username, hash_password(user.password))
            )
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="User already exists")
    except Exception:
        raise HTTPException(status_code=500, detail="Registration failed")

    return {"msg": "User registered successfully"}

@app.post("/auth/login")
@limiter.limit("5/minute")
def login(request: Request, user: UserLogin):
    with db_session() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username=?", (user.username,))
        db_user = cur.fetchone()

    if not db_user or not verify_password(
        user.password, db_user["password"]
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(db_user["id"])})
    return {"access_token": token}

@app.post("/auth/forgot-password")
@limiter.limit("3/minute")
def forgot_password(request: Request, data: dict):
    email = data["username"]

    with db_session() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE username=?", (email,))
        user = cur.fetchone()

        if user:
            token = secrets.token_urlsafe(32)
            expiry = (datetime.utcnow() + timedelta(minutes=30)).isoformat()
            cur.execute(
                "UPDATE users SET reset_token=?, reset_expiry=? WHERE username=?",
                (token, expiry, email)
            )
            reset_link = f"http://localhost:5173/reset-password/{token}"
            send_reset_email(email, reset_link)

    return {"msg": "If that account exists, a reset link has been sent."}

@app.post("/auth/reset-password")
def reset_password(data: dict):
    token = data["token"]
    new_password = hash_password(data["password"])

    with db_session() as conn:
        cur = conn.cursor()
        cur.execute("""
          SELECT id FROM users
          WHERE reset_token=? AND reset_expiry > ?
        """, (token, datetime.utcnow().isoformat()))

        user = cur.fetchone()

        if not user:
            raise HTTPException(400, "Invalid or expired token")

        cur.execute("""
          UPDATE users
          SET password=?, reset_token=NULL, reset_expiry=NULL
          WHERE id=?
        """, (new_password, user["id"]))

    return {"msg": "Password updated"}

@app.post("/auth/google")
def google_login(data: dict):
    token = data["token"]

    try:
        info = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(401, "Invalid Google token")

    email = info["email"]

    with db_session() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username=?", (email,))
        user = cur.fetchone()

        if not user:
            cur.execute(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                (email, hash_password(secrets.token_urlsafe(16)))
            )
            user_id = cur.lastrowid
        else:
            user_id = user["id"]

    jwt_token = create_access_token({"sub": user_id})
    return {"access_token": jwt_token}

class ChangeEmailRequest(BaseModel):
    email: str


@app.post("/auth/change-email")
def change_email(data: ChangeEmailRequest, user_id=Depends(get_current_user)):
    with db_session() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE username=?", (data.email,))
        existing = cur.fetchone()

        if existing and existing["id"] != user_id:
            raise HTTPException(status_code=400, detail="Email already in use")

        cur.execute("UPDATE users SET username=? WHERE id=?", (data.email, user_id))

    return {"message": "Email updated successfully"}


@app.post("/auth/change-password")
def change_password(data: ChangePasswordRequest, user_id=Depends(get_current_user)):
    hashed = hash_password(data.password)

    with db_session() as conn:
        cur = conn.cursor()
        cur.execute("UPDATE users SET password=? WHERE id=?", (hashed, user_id))

    return {"message": "Password updated successfully"}


@app.delete("/auth/delete-account")
def delete_account(user_id=Depends(get_current_user)):
    with db_session() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM cases WHERE user_id=?", (user_id,))
        cur.execute("DELETE FROM users WHERE id=?", (user_id,))

    return {"message": "Account deleted"}

# ----------------------------------
# SCAN (PROTECTED)
# ----------------------------------
@app.post("/scan")
def scan_url(
    req: ScanRequest,
    user_id=Depends(get_current_user)
):
    try:
        prob, label = predict_url(req.url)
    except Exception as e:
        raise HTTPException(status_code=503, detail="Scan engine unavailable, try again later")

    features = extract_features(req.url)
    reasons = analyze_rules(req.url, features)

    risk = "HIGH" if prob > 0.8 else "MEDIUM" if prob > 0.5 else "LOW"
    decision = "SUSPICIOUS" if prob > 0.5 else "SAFE"

    explanation = generate_explanation(
        req.url,
        prob,
        decision,
        reasons,
        features
    )

    case_id = f"PH-{datetime.now().year}-{uuid.uuid4().hex[:8].upper()}"

    with db_session() as conn:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cases (
                case_id, user_id, url, probability, decision,
                risk_level, reasons, explanation, features, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            case_id,
            user_id,
            req.url,
            prob,
            decision,
            risk,
            json.dumps(reasons),
            explanation,
            json.dumps(features),
            datetime.now().isoformat()
        ))

    return {
        "case_id": case_id,
        "url": req.url,
        "probability": round(prob, 2),
        "decision": decision,
        "risk_level": risk,
        "reasons": reasons,
        "explanation": explanation,
        "features": features
    }

# ----------------------------------
# USER CASE HISTORY
# ----------------------------------
@app.get("/cases")
def get_user_cases(user_id=Depends(get_current_user)):
    with db_session() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM cases WHERE user_id=? ORDER BY created_at DESC",
            (user_id,)
        )
        rows = cur.fetchall()

    return [dict(r) for r in rows]

# ----------------------------------
# SINGLE CASE
# ----------------------------------
@app.get("/case/{case_id}")
def get_case(case_id: str, user_id=Depends(get_current_user)):
    with db_session() as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT * FROM cases
            WHERE case_id=? AND user_id=?
        """, (case_id, user_id))
        row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Case not found")

    return dict(row)
