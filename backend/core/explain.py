import shap
import numpy as np
from core.predictor import model, vectorizer

# -------------------------------
# SHAP Explainer Setup
# -------------------------------
background = vectorizer.transform(["https://example.com"])
masker = shap.maskers.Independent(background)
explainer = shap.LinearExplainer(model, masker)


def extract_shap_tokens(url, top_k=5):
    """
    Extract most influential URL tokens using SHAP
    """
    X = vectorizer.transform([url])
    shap_values = explainer.shap_values(X)[0]
    feature_names = vectorizer.get_feature_names_out()

    url = url.lower()
    idxs = np.argsort(np.abs(shap_values))[::-1]

    tokens = []
    for i in idxs:
        token = feature_names[i]
        if token in url and len(token) >= 3:
            tokens.append(token)
        if len(tokens) >= top_k:
            break

    return tokens


def generate_explanation(url, probability, decision, reasons, features):
    """
    Merge ML confidence + rule-based reasons + SHAP tokens
    into ONE explainable paragraph
    """

    explanation = []

    # -------------------------------
    # Decision context
    # -------------------------------
    if decision == "SUSPICIOUS":
        explanation.append(
            f"The scanned URL was identified as potentially malicious based on learned phishing patterns."
        )
    else:
        explanation.append(
            f"The scanned URL does not strongly match known phishing patterns."
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
    # SHAP-based explanations
    # -------------------------------
    shap_tokens = extract_shap_tokens(url)
    if shap_tokens:
        explanation.append(
            "The AI model focused on URL components such as "
            + ", ".join(shap_tokens)
            + " which are commonly abused in phishing attacks."
        )

    # -------------------------------
    # Structural feature explanation
    # -------------------------------
    if features.get("has_ip"):
        explanation.append(
            "Using an IP address instead of a domain name is a strong phishing signal."
        )

    return " ".join(explanation)
