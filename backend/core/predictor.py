import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "model", "phishai_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "model", "tfidf_vectorizer.pkl")

model = None
vectorizer = None

def load_model():
    global model, vectorizer

    if model is None:
        model = joblib.load(MODEL_PATH)

    if vectorizer is None:
        vectorizer = joblib.load(VECTORIZER_PATH)


def predict_url(url: str):
    try:
        load_model()

        X = vectorizer.transform([url])
        prob = model.predict_proba(X)[0][1]

        label = "PHISHING" if prob > 0.5 else "BENIGN"
        return prob, label

    except Exception as e:
        print("MODEL ERROR:", str(e))
        return 0.0, "ERROR"