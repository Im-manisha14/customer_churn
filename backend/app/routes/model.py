"""Model metrics and feature importance routes."""

import json
from pathlib import Path
from fastapi import APIRouter
from app.schemas.prediction import ModelMetrics

MODEL_DIR = Path(__file__).parent.parent.parent / "models"

router = APIRouter()

def _load_metrics() -> ModelMetrics:
    """Load real metrics if available, else return demo values."""
    path = MODEL_DIR / "metrics.json"
    if path.exists():
        data = json.loads(path.read_text())
        return ModelMetrics(**data)
    return ModelMetrics(
        accuracy=0.821, precision=0.648, recall=0.783,
        f1Score=0.709, rocAuc=0.862, prAuc=0.674, isDemo=True,
    )

def _load_features() -> list:
    """Load real feature importance if available, else return demo values."""
    path = MODEL_DIR / "feature_importance.json"
    if path.exists():
        return json.loads(path.read_text())
    return DEMO_FEATURES

DEMO_FEATURES = [
    {"feature": "Contract",        "displayName": "Contract Type",     "importance": 0.312, "description": "Month-to-month contracts are strongly associated with higher churn rates."},
    {"feature": "MonthlyCharges",  "displayName": "Monthly Charges",   "importance": 0.247, "description": "Higher monthly charges correlate with increased churn likelihood."},
    {"feature": "tenure",          "displayName": "Tenure (months)",   "importance": 0.198, "description": "Shorter tenure customers are at higher risk."},
    {"feature": "InternetService", "displayName": "Internet Service",  "importance": 0.143, "description": "Fiber optic customers show notably higher churn rates."},
    {"feature": "PaymentMethod",   "displayName": "Payment Method",    "importance": 0.121, "description": "Electronic check users churn significantly more."},
    {"feature": "TechSupport",     "displayName": "Tech Support",      "importance": 0.098, "description": "Customers without tech support are more likely to churn."},
    {"feature": "OnlineSecurity",  "displayName": "Online Security",   "importance": 0.087, "description": "Absence of online security is associated with higher churn."},
    {"feature": "TotalCharges",    "displayName": "Total Charges",     "importance": 0.076, "description": "Lower totals indicate newer, higher-risk customers."},
    {"feature": "PaperlessBilling","displayName": "Paperless Billing", "importance": 0.064, "description": "Paperless billing customers show slightly elevated churn."},
    {"feature": "SeniorCitizen",   "displayName": "Senior Citizen",    "importance": 0.052, "description": "Senior citizens show modestly higher churn probability."},
]

DEMO_CONFUSION_MATRIX = {"tn": 3891, "fp": 251, "fn": 319, "tp": 1173}

DEMO_ROC_CURVE = [
    {"fpr": 0.00, "tpr": 0.00}, {"fpr": 0.02, "tpr": 0.18}, {"fpr": 0.05, "tpr": 0.38},
    {"fpr": 0.08, "tpr": 0.52}, {"fpr": 0.12, "tpr": 0.63}, {"fpr": 0.16, "tpr": 0.71},
    {"fpr": 0.22, "tpr": 0.77}, {"fpr": 0.28, "tpr": 0.82}, {"fpr": 0.35, "tpr": 0.86},
    {"fpr": 0.43, "tpr": 0.89}, {"fpr": 0.52, "tpr": 0.92}, {"fpr": 0.62, "tpr": 0.94},
    {"fpr": 0.73, "tpr": 0.96}, {"fpr": 0.85, "tpr": 0.98}, {"fpr": 1.00, "tpr": 1.00},
]

DEMO_PR_CURVE = [
    {"recall": 0.00, "precision": 1.00}, {"recall": 0.10, "precision": 0.93},
    {"recall": 0.20, "precision": 0.87}, {"recall": 0.30, "precision": 0.82},
    {"recall": 0.40, "precision": 0.77}, {"recall": 0.50, "precision": 0.73},
    {"recall": 0.60, "precision": 0.68}, {"recall": 0.70, "precision": 0.63},
    {"recall": 0.783, "precision": 0.648}, {"recall": 0.85, "precision": 0.57},
    {"recall": 0.92, "precision": 0.49}, {"recall": 1.00, "precision": 0.265},
]


@router.get("/metrics", response_model=ModelMetrics)
async def get_metrics():
    """Load real metrics.json when model is trained, else returns demo values."""
    return _load_metrics()


@router.get("/features")
async def get_feature_importance():
    """Load real feature_importance.json when model is trained, else returns demo values."""
    return _load_features()


@router.get("/confusion-matrix")
async def get_confusion_matrix():
    path = MODEL_DIR / "metrics.json"
    if path.exists():
        data = json.loads(path.read_text())
        if "confusionMatrix" in data:
            return data["confusionMatrix"]
    return DEMO_CONFUSION_MATRIX


@router.get("/roc-curve")
async def get_roc_curve():
    path = MODEL_DIR / "metrics.json"
    if path.exists():
        data = json.loads(path.read_text())
        if "rocCurve" in data:
            return data["rocCurve"]
    return DEMO_ROC_CURVE


@router.get("/pr-curve")
async def get_pr_curve():
    path = MODEL_DIR / "metrics.json"
    if path.exists():
        data = json.loads(path.read_text())
        if "prCurve" in data:
            return data["prCurve"]
    return DEMO_PR_CURVE
