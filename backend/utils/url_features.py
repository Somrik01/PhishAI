import re
from urllib.parse import urlparse

def extract_features(url):
    parsed = urlparse(url)
    hostname = parsed.hostname or ""

    return {
        "url_length": len(url),
        "num_digits": sum(c.isdigit() for c in url),
        "num_hyphens": url.count("-"),
        "num_subdomains": max(hostname.count(".") - 1, 0),
        "has_ip": bool(re.search(r"^\d+\.\d+\.\d+\.\d+$", hostname))
    }