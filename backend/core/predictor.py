import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "model", "phishai_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "model", "tfidf_vectorizer.pkl")

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

def predict_url(url: str):
    X = vectorizer.transform([url])
    prob = model.predict_proba(X)[0][1]
    label = "PHISHING" if prob > 0.5 else "BENIGN"
    return prob, label
