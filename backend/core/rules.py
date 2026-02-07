def analyze_rules(url, features):
    reasons = []

    if any(b in url.lower() for b in ["paypal", "google", "bank", "login"]):
        reasons.append("Possible brand impersonation")

    if features["num_hyphens"] >= 2:
        reasons.append("Excessive hyphens in domain")

    if url.endswith((".xyz", ".tk", ".top")):
        reasons.append("Suspicious top-level domain")

    if not url.startswith("https"):
        reasons.append("Non-secure HTTP protocol")

    if not reasons:
        reasons.append("No major phishing indicators detected")

    return reasons
