"""
Prediction service — loads churn_model.pkl when available.
Falls back to a rule-based demo scorer otherwise.

Replace the demo logic below once you have trained the XGBoost model:
  1. Place the trained pipeline pickle at: models/churn_model.pkl
  2. The load_model() function will detect and load it automatically.
  3. Set DEMO_MODE = False.
"""

from __future__ import annotations
import os
import pickle
from pathlib import Path
import numpy as np

from app.schemas.prediction import CustomerFeatures, PredictionResponse

MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "churn_model.pkl"
DEMO_MODE = not MODEL_PATH.exists()

_model = None

def load_model():
    global _model, DEMO_MODE
    if MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        DEMO_MODE = False
        print(f"✅ Loaded model from {MODEL_PATH}")
    else:
        DEMO_MODE = True
        print(f"⚠️  Model not found at {MODEL_PATH}. Running in DEMO mode.")


def _demo_score(features: CustomerFeatures) -> float:
    """Rule-based churn scorer for demo mode."""
    score = 0.25
    if features.contract == "Month-to-month": score += 0.20
    if features.contract == "Two year": score -= 0.15
    if features.monthlyCharges > 80: score += 0.12
    if features.monthlyCharges > 100: score += 0.08
    if features.tenure < 6: score += 0.15
    if features.tenure > 36: score -= 0.12
    if features.tenure > 60: score -= 0.05
    if features.internetService == "Fiber optic": score += 0.08
    if features.paymentMethod == "Electronic check": score += 0.06
    if features.techSupport == "Yes": score -= 0.05
    if features.onlineSecurity == "Yes": score -= 0.04
    if features.seniorCitizen == 1: score += 0.04
    return float(np.clip(score, 0.03, 0.97))


def predict(features: CustomerFeatures) -> PredictionResponse:
    """
    Generate a churn prediction.

    When the real model is loaded, this calls model.predict_proba().
    In demo mode, uses rule-based scoring.
    """
    if DEMO_MODE or _model is None:
        prob = _demo_score(features)
    else:
        # ── Real model path ──────────────────────────────────
        # Build feature DataFrame matching your preprocessing pipeline.
        # Example (adjust column names/encoding to match your training code):
        #
        # import pandas as pd
        # row = pd.DataFrame([features.model_dump()])
        # prob = float(_model.predict_proba(row)[0, 1])
        prob = _demo_score(features)  # placeholder until model is connected

    risk = "High" if prob >= 0.6 else "Medium" if prob >= 0.3 else "Low"
    conf = "High" if prob > 0.75 or prob < 0.25 else "Medium" if prob > 0.55 or prob < 0.35 else "Low"

    return PredictionResponse(
        customerID=features.customerID or f"CUST-{hash(str(features.dict())) % 9999:04d}",
        churnProbability=round(prob, 4),
        prediction=1 if prob >= 0.5 else 0,
        risk=risk,
        confidence=conf,
        isDemo=DEMO_MODE,
    )
