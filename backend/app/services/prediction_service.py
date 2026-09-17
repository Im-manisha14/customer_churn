"""
Prediction service — loads churn_model.pkl when available.
Falls back to a rule-based demo scorer otherwise.
"""

from __future__ import annotations
import pickle
from pathlib import Path
import numpy as np
import pandas as pd

from app.schemas.prediction import CustomerFeatures, PredictionResponse

MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "churn_model.pkl"
DEMO_MODE = not MODEL_PATH.exists()

_pipeline = None
_num_features = []
_cat_features = []


def load_model():
    global _pipeline, _num_features, _cat_features, DEMO_MODE
    if MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            saved = pickle.load(f)
        # Support both dict format (new) and raw pipeline (old)
        if isinstance(saved, dict):
            _pipeline     = saved["pipeline"]
            _num_features = saved.get("num_features", [])
            _cat_features = saved.get("cat_features", [])
        else:
            _pipeline = saved
        DEMO_MODE = False
        print(f"[OK] Loaded model from {MODEL_PATH}")
    else:
        DEMO_MODE = True
        print(f"[INFO] Model not found at {MODEL_PATH}. Running in DEMO mode.")

# Automatically load trained model on module import
load_model()


def _build_dataframe(features: CustomerFeatures) -> pd.DataFrame:
    """
    Map CustomerFeatures (camelCase API fields) → training column names.
    Must exactly match what train_model.py produces after renaming.
    """
    row = {
        "SeniorCitizen":   features.seniorCitizen,
        "tenure":          features.tenure,
        "MonthlyCharges":  features.monthlyCharges,
        "TotalCharges":    features.totalCharges,
        "Gender":          features.gender,
        "Partner":         features.partner,
        "Dependents":      features.dependents,
        "PhoneService":    features.phoneService,
        "MultipleLines":   features.multipleLines,
        "InternetService": features.internetService,
        "OnlineSecurity":  features.onlineSecurity,
        "OnlineBackup":    features.onlineBackup,
        "DeviceProtection":features.deviceProtection,
        "TechSupport":     features.techSupport,
        "StreamingTV":     features.streamingTV,
        "StreamingMovies": features.streamingMovies,
        "Contract":        features.contract,
        "PaperlessBilling":features.paperlessBilling,
        "PaymentMethod":   features.paymentMethod,
    }

    # Engineered features (must match train_model.py logic)
    t = features.tenure
    row["TenureGroup"] = (
        0 if t <= 6 else 1 if t <= 12 else 2 if t <= 24 else 3 if t <= 48 else 4
    )
    row["ChargesPerMonth"] = features.totalCharges / (features.tenure + 1)

    service_vals = [
        features.phoneService, features.onlineSecurity, features.onlineBackup,
        features.deviceProtection, features.techSupport,
        features.streamingTV, features.streamingMovies,
    ]
    row["ServiceCount"] = sum(1 for v in service_vals if v == "Yes")

    return pd.DataFrame([row])


def _demo_score(features: CustomerFeatures) -> float:
    """Rule-based churn scorer for demo mode."""
    score = 0.25
    if features.contract == "Month-to-month": score += 0.20
    if features.contract == "Two year":       score -= 0.15
    if features.monthlyCharges > 80:          score += 0.12
    if features.monthlyCharges > 100:         score += 0.08
    if features.tenure < 6:                   score += 0.15
    if features.tenure > 36:                  score -= 0.12
    if features.tenure > 60:                  score -= 0.05
    if features.internetService == "Fiber optic": score += 0.08
    if features.paymentMethod == "Electronic check": score += 0.06
    if features.techSupport == "Yes":         score -= 0.05
    if features.onlineSecurity == "Yes":      score -= 0.04
    if features.seniorCitizen == 1:           score += 0.04
    return float(np.clip(score, 0.03, 0.97))


def predict(features: CustomerFeatures) -> PredictionResponse:
    """Generate a churn prediction using the real model or demo fallback."""
    if DEMO_MODE or _pipeline is None:
        prob = _demo_score(features)
        is_demo = True
    else:
        try:
            df = _build_dataframe(features)
            prob = float(_pipeline.predict_proba(df)[0, 1])
            is_demo = False
        except Exception as e:
            print(f"[WARN] Model prediction failed: {e} — falling back to demo")
            prob = _demo_score(features)
            is_demo = True

    risk = "High" if prob >= 0.6 else "Medium" if prob >= 0.3 else "Low"
    conf = "High" if prob > 0.75 or prob < 0.25 else \
           "Medium" if prob > 0.55 or prob < 0.35 else "Low"

    return PredictionResponse(
        customerID=features.customerID or f"CUST-{abs(hash(features.tenure)) % 9999:04d}",
        churnProbability=round(prob, 4),
        prediction=1 if prob >= 0.5 else 0,
        risk=risk,
        confidence=conf,
        isDemo=is_demo,
    )
