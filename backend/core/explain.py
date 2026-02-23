import numpy as np
from core.predictor import model, vectorizer


def extract_top_tokens(url, top_k=5):
    """
    Extract important tokens based on model coefficients (lightweight alternative to SHAP)
    """
    try:
        X = vectorizer.transform([url])
        feature_names = vectorizer.get_feature_names_out()

        # Get model weights (for LogisticRegression)
        coefs = model.coef_[0]

        # Multiply feature values with weights
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


def generate_explanation(url, probability, decision, reasons, features):
    """
    Generate human-readable explanation without SHAP
    """

    explanation = []

    # -------------------------------
    # Decision context
    # -------------------------------
    if decision == "SUSPICIOUS":
        explanation.append(
            "The scanned URL was identified as potentially malicious based on learned phishing patterns."
        )
    else:
        explanation.append(
            "The scanned URL does not strongly match known phishing patterns."
        )

    # -------------------------------
    # Probability interpretation
    # -------------------------------
    if probability > 0.8:
        explanation.append(
            "The model assigns a very high phishing probability, indicating strong malicious indicators."
        )
    elif probability > 0.5:
        explanation.append(
            "The model detected multiple suspicious characteristics that require caution."
        )
    else:
        explanation.append(
            "The phishing probability is low, but users should still remain cautious online."
        )

    # -------------------------------
    # Rule-based explanations
    # -------------------------------
    if reasons:
        explanation.append(
            "Key rule-based risk indicators include: " + ", ".join(reasons[:3]) + "."
        )

    # -------------------------------
    # Token-based explanation (replacement for SHAP)
    # -------------------------------
    tokens = extract_top_tokens(url)
    if tokens:
        explanation.append(
            "The model focused on URL components such as "
            + ", ".join(tokens)
            + " which are commonly used in phishing attempts."
        )

    # -------------------------------
    # Structural feature explanation
    # -------------------------------
    if features.get("has_ip"):
        explanation.append(
            "Using an IP address instead of a domain name is a strong phishing signal."
        )

    return " ".join(explanation)