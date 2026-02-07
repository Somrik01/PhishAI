from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.explain import generate_explanation
from core.predictor import predict_url
from core.rules import analyze_rules
from utils.url_features import extract_features
from db import init_db, get_db
from auth import GOOGLE_CLIENT_ID
from google.oauth2 import id_token
from google.auth.transport import requests
from models import UserCreate, UserLogin
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
import secrets
from datetime import timedelta
import json
from datetime import datetime

# ----------------------------------
# App Init
# ----------------------------------
app = FastAPI(
    title="PhishAI Backend",
    description="SOC-style Phishing Detection API",
    version="2.0"
)

init_db()

# ----------------------------------
# CORS
# ----------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
# Helpers
# ----------------------------------
def generate_case_id():
    year = datetime.now().year
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM cases")
    count = cur.fetchone()[0] + 1
    conn.close()
    return f"PH-{year}-{str(count).zfill(6)}"

# ----------------------------------
# Root
# ----------------------------------
@app.get("/")
def root():
    return {"status": "PhishAI backend running 🚀"}

# ----------------------------------
# AUTH
# ----------------------------------
@app.post("/auth/register")
def register(user: UserCreate):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (user.username, hash_password(user.password))
        )
        conn.commit()
    except:
        raise HTTPException(status_code=400, detail="User already exists")
    finally:
        conn.close()

    return {"msg": "User registered successfully"}

@app.post("/auth/login")
def login(user: UserLogin):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username=?", (user.username,))
    db_user = cur.fetchone()
    conn.close()

    if not db_user or not verify_password(
        user.password, db_user["password"]
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(db_user["id"])})
    return {"access_token": token}

@app.post("/auth/forgot-password")
def forgot_password(data: dict):
    email = data["username"]

    token = secrets.token_urlsafe(32)
    expiry = (datetime.utcnow() + timedelta(minutes=30)).isoformat()

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "UPDATE users SET reset_token=?, reset_expiry=? WHERE username=?",
        (token, expiry, email)
    )
    conn.commit()
    conn.close()

    return {
        "msg": "Reset link generated",
        "reset_link": f"http://localhost:5173/reset-password/{token}"
    }

@app.post("/auth/reset-password")
def reset_password(data: dict):
    token = data["token"]
    new_password = hash_password(data["password"])

    conn = get_db()
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

    conn.commit()
    conn.close()

    return {"msg": "Password updated"}

@app.post("/auth/google")
def google_login(data: dict):
    token = data["token"]

    try:
        info = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID
        )
    except:
        raise HTTPException(401, "Invalid Google token")

    email = info["email"]

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE username=?", (email,))
    user = cur.fetchone()

    if not user:
        cur.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (email, hash_password(secrets.token_urlsafe(16)))
        )
        conn.commit()
        user_id = cur.lastrowid
    else:
        user_id = user["id"]

    conn.close()

    jwt_token = create_access_token({"sub": user_id})
    return {"access_token": jwt_token}


# ----------------------------------
# SCAN (PROTECTED)
# ----------------------------------
@app.post("/scan")
def scan_url(
    req: ScanRequest,
    user_id=Depends(get_current_user)
):
    prob, label = predict_url(req.url)
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

    case_id = generate_case_id()

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    conn.commit()
    conn.close()

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
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM cases WHERE user_id=? ORDER BY created_at DESC",
        (user_id,)
    )
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ----------------------------------
# SINGLE CASE
# ----------------------------------
@app.get("/case/{case_id}")
def get_case(case_id: str, user_id=Depends(get_current_user)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM cases
        WHERE case_id=? AND user_id=?
    """, (case_id, user_id))
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Case not found")

    return dict(row)
