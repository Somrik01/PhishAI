import numpy as np
from core.predictor import load_model
from core import predictor

def extract_top_tokens(url, top_k=5):
    try:
        load_model()

        X = predictor.vectorizer.transform([url])
        feature_names = predictor.vectorizer.get_feature_names_out()
        coefs = predictor.model.coef_[0]

        scores = X.toarray()[0] * coefs
        idxs = np.argsort(np.abs(scores))[::-1]

        tokens = []
        for i in idxs:
            token = feature_names[i]
            if token in url.lower() and len(token) >= 3:
                tokens.append(token)
            if len(tokens) >= top_k:
                break

        return tokens

    except Exception:
        return []


# ✅ MAKE SURE THIS FUNCTION EXISTS (this is your error)
def generate_explanation(url, probability, decision, reasons, features):
    explanation = []

    if decision == "SUSPICIOUS":
        explanation.append(
            "The scanned URL was identified as potentially malicious based on learned phishing patterns."
        )
    else:
        explanation.append(
            "The scanned URL does not strongly match known phishing patterns."
        )

    if probability > 0.8:
        explanation.append(
            "The model assigns a very high phishing probability."
        )
    elif probability > 0.5:
        explanation.append(
            "The model detected suspicious characteristics."
        )
    else:
        explanation.append(
            "The phishing probability is low."
        )

    if reasons:
        explanation.append(
            "Key indicators: " + ", ".join(reasons[:3])
        )

    tokens = extract_top_tokens(url)
    if tokens:
        explanation.append(
            "Suspicious URL parts: " + ", ".join(tokens)
        )

    if features.get("has_ip"):
        explanation.append(
            "Using an IP instead of domain is suspicious."
        )

    return " ".join(explanation)