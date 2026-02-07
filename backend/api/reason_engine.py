def generate_reason(url: str, probability: float):
    reasons = []

    if "paypal" in url.lower() and not url.startswith("https"):
        reasons.append("Domain tries to mimic PayPal using non-secure URL.")

    if any(word in url.lower() for word in ["login", "verify", "secure"]):
        reasons.append("URL contains phishing-related keywords.")

    if probability > 0.9 and not reasons:
        reasons.append("High-risk pattern detected by ML model.")

    return reasons[0] if reasons else "Suspicious pattern detected."
