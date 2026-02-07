# 🛡️ PhishAI — AI-Powered Phishing Detection Platform

PhishAI is a **SOC-style cybersecurity platform** that detects phishing URLs using **Machine Learning, rule-based analysis, and explainable AI**.

It allows users to:
- Scan URLs for phishing
- See risk levels and probability
- Get AI explanations
- Track cases in a professional dashboard
- Maintain user-specific case history

---

## 🚀 Features

### 🔐 Authentication
- Username & password login
- Secure Argon2 password hashing
- JWT-based authentication
- Google OAuth login
- Forgot & Reset password flow

### 🧠 AI Detection
- ML model predicts phishing probability
- Rule-based engine adds security signals
- Explainable AI generates human-readable reasons

### 📂 Case Management
- Every scan becomes a **case**
- Each user sees only their own cases
- History stored in database
- Detailed case view with:
  - URL
  - Risk level
  - AI explanation
  - Features used

### 📊 SOC-Style Dashboard
- Scan URLs
- View history
- Threat intelligence
- Case drill-down
- Settings & profile

---

## 🧱 Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | React, Vite |
| Backend | FastAPI |
| Database | SQLite |
| AI Model | Python ML |
| Security | JWT, Argon2 |
| Auth | Google OAuth |
| API | REST |

---

## ⚙️ How to Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

