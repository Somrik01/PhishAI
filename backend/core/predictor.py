import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "model", "phishai_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "model", "tfidf_vectorizer.pkl")

model = None
vectorizer = None


# ✅ Load ONLY ONCE (startup-safe)
def load_model():
    global model, vectorizer

    if model is None:
        print("🔄 Loading ML model...")
        model = joblib.load(MODEL_PATH)

    if vectorizer is None:
        print("🔄 Loading vectorizer...")
        vectorizer = joblib.load(VECTORIZER_PATH)


# ✅ Main prediction function
def predict_url(url: str):
    try:
        load_model()

        # Transform URL safely
        X = vectorizer.transform([url])

        # Predict probability
        prob = float(model.predict_proba(X)[0][1])

        # Label
        label = "PHISHING" if prob > 0.5 else "BENIGN"

        return prob, label

    except Exception as e:
        print("❌ Prediction error:", str(e))

        # Fallback (prevents crash → avoids 502)
        return 0.0, "ERROR"