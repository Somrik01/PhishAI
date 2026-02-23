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