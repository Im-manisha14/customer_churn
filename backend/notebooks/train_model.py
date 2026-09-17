"""
ChurnIQ — XGBoost Model Training Script
========================================
Compatible with the IBM Telco Customer Churn dataset (extended version).

Usage (from backend/ folder, with venv activated):
    python notebooks/train_model.py

Dataset expected at:
    backend/data/telco_customer_churn.csv

Output files:
    backend/models/churn_model.pkl
    backend/models/metrics.json
    backend/models/feature_importance.json
"""

import os
import json
import pickle
import warnings
import numpy as np
import pandas as pd
from pathlib import Path

from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, average_precision_score,
    confusion_matrix, classification_report,
)
import xgboost as xgb

warnings.filterwarnings("ignore")

# ── Paths ─────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent.parent          # backend/
DATA_PATH  = BASE_DIR / "data" / "telco_customer_churn.csv"
MODEL_DIR  = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "churn_model.pkl"
METRICS_PATH  = MODEL_DIR / "metrics.json"
FEATURES_PATH = MODEL_DIR / "feature_importance.json"

MODEL_DIR.mkdir(exist_ok=True)

# ═════════════════════════════════════════════════════════════
# STEP 1 — LOAD DATA
# ═════════════════════════════════════════════════════════════

print("\n" + "="*55)
print("STEP 1 — Loading data")
print("="*55)

if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"\n❌  Dataset not found at:\n    {DATA_PATH}\n\n"
        "    Expected file: backend/data/telco_customer_churn.csv\n"
    )

df = pd.read_csv(DATA_PATH)
print(f"✅  Loaded {len(df):,} rows × {len(df.columns)} columns")

# ═════════════════════════════════════════════════════════════
# STEP 2 — EDA SUMMARY
# ═════════════════════════════════════════════════════════════

print("\n" + "="*55)
print("STEP 2 — EDA Summary")
print("="*55)

# This dataset uses "Churn Label" (Yes/No) and "Churn Value" (0/1)
# and "Tenure Months" instead of "tenure", etc.
print(f"  Columns: {list(df.columns)}")

churn_col = "Churn Label" if "Churn Label" in df.columns else "Churn"
print(f"  Using churn column: '{churn_col}'")
print(f"  Churn distribution:\n{df[churn_col].value_counts().to_string()}")
churn_rate = (df[churn_col] == "Yes").mean() * 100
print(f"  Churn rate: {churn_rate:.1f}%")

# ═════════════════════════════════════════════════════════════
# STEP 3 — COLUMN MAPPING & PREPROCESSING
# ═════════════════════════════════════════════════════════════

print("\n" + "="*55)
print("STEP 3 — Column Mapping & Preprocessing")
print("="*55)

# Rename columns to standard names (handles both dataset variants)
COLUMN_MAP = {
    "Tenure Months": "tenure",
    "Phone Service":   "PhoneService",
    "Multiple Lines":  "MultipleLines",
    "Internet Service":"InternetService",
    "Online Security": "OnlineSecurity",
    "Online Backup":   "OnlineBackup",
    "Device Protection":"DeviceProtection",
    "Tech Support":    "TechSupport",
    "Streaming TV":    "StreamingTV",
    "Streaming Movies":"StreamingMovies",
    "Paperless Billing":"PaperlessBilling",
    "Payment Method":  "PaymentMethod",
    "Monthly Charges": "MonthlyCharges",
    "Total Charges":   "TotalCharges",
    "Senior Citizen":  "SeniorCitizenRaw",
    "Churn Label":     "Churn",
    "Churn Value":     "ChurnValue",
}
df.rename(columns=COLUMN_MAP, inplace=True)
print(f"  ✅  Columns renamed")

# Drop columns not needed for modelling
DROP_COLS = [
    "CustomerID", "Count", "Country", "State", "City", "Zip Code",
    "Lat Long", "Latitude", "Longitude", "Churn Score", "CLTV",
    "Churn Reason", "ChurnValue",   # ChurnValue duplicates our target
]
df.drop(columns=[c for c in DROP_COLS if c in df.columns], inplace=True, errors="ignore")
print(f"  ✅  Dropped non-feature columns")

# Fix TotalCharges (blanks = brand-new customers)
df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
n_fill = df["TotalCharges"].isna().sum()
df["TotalCharges"].fillna(df["MonthlyCharges"], inplace=True)
print(f"  TotalCharges: {n_fill} blanks → filled with MonthlyCharges")

# Encode SeniorCitizen: handles "Yes"/"No" strings or 0/1 integers
if "SeniorCitizenRaw" in df.columns:
    df["SeniorCitizen"] = df["SeniorCitizenRaw"].map({"Yes": 1, "No": 0, 1: 1, 0: 0}).fillna(0).astype(int)
    df.drop(columns=["SeniorCitizenRaw"], inplace=True)
elif "SeniorCitizen" in df.columns:
    sc = df["SeniorCitizen"]
    if sc.dtype == object:
        df["SeniorCitizen"] = sc.map({"Yes": 1, "No": 0}).fillna(0).astype(int)
    else:
        df["SeniorCitizen"] = sc.fillna(0).astype(int)
print(f"  SeniorCitizen encoded as 0/1")

# Target
if "Churn" in df.columns:
    df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})
else:
    raise ValueError("No 'Churn' column found after renaming!")
print(f"  Target 'Churn': Yes→1, No→0")

# ═════════════════════════════════════════════════════════════
# STEP 4 — FEATURE ENGINEERING
# ═════════════════════════════════════════════════════════════

print("\n" + "="*55)
print("STEP 4 — Feature Engineering")
print("="*55)

# Tenure group bucket
def tenure_group(t):
    if t <= 6:  return 0
    if t <= 12: return 1
    if t <= 24: return 2
    if t <= 48: return 3
    return 4

df["TenureGroup"] = df["tenure"].apply(tenure_group)

# Charge ratio (total paid / tenure)
df["ChargesPerMonth"] = df["TotalCharges"] / (df["tenure"] + 1)

# Count of active services
service_cols = ["PhoneService", "OnlineSecurity", "OnlineBackup",
                "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies"]
df["ServiceCount"] = df[[c for c in service_cols if c in df.columns]] \
    .apply(lambda col: col.map({"Yes": 1, "No": 0, "No internet service": 0,
                                "No phone service": 0})).sum(axis=1)

print(f"  ✅  Added: TenureGroup, ChargesPerMonth, ServiceCount")

# ═════════════════════════════════════════════════════════════
# STEP 5 — DEFINE FEATURES
# ═════════════════════════════════════════════════════════════

print("\n" + "="*55)
print("STEP 5 — Feature Selection")
print("="*55)

NUM_FEATURES = [c for c in [
    "SeniorCitizen", "tenure", "MonthlyCharges", "TotalCharges",
    "TenureGroup", "ChargesPerMonth", "ServiceCount",
] if c in df.columns]

CAT_FEATURES = [c for c in [
    "Gender", "Partner", "Dependents", "PhoneService", "MultipleLines",
    "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection",
    "TechSupport", "StreamingTV", "StreamingMovies",
    "Contract", "PaperlessBilling", "PaymentMethod",
] if c in df.columns]

print(f"  Numeric  ({len(NUM_FEATURES)}): {NUM_FEATURES}")
print(f"  Categorical ({len(CAT_FEATURES)}): {CAT_FEATURES}")

X = df[NUM_FEATURES + CAT_FEATURES].copy()
y = df["Churn"].copy()

# ═════════════════════════════════════════════════════════════
# STEP 6 — TRAIN / TEST SPLIT
# ═════════════════════════════════════════════════════════════

print("\n" + "="*55)
print("STEP 6 — Train/Test Split")
print("="*55)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"  Train: {len(X_train):,}   Test: {len(X_test):,}")
print(f"  Churn in train: {y_train.mean()*100:.1f}%   in test: {y_test.mean()*100:.1f}%")

# ═════════════════════════════════════════════════════════════
# STEP 7 — BUILD & TRAIN PIPELINE
# ═════════════════════════════════════════════════════════════

print("\n" + "="*55)
print("STEP 7 — Training XGBoost Pipeline")
print("="*55)

neg, pos = (y_train == 0).sum(), (y_train == 1).sum()
scale_pos_weight = neg / pos
print(f"  Class imbalance — scale_pos_weight: {scale_pos_weight:.2f}")

preprocessor = ColumnTransformer(transformers=[
    ("num", StandardScaler(), NUM_FEATURES),
    ("cat", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1), CAT_FEATURES),
])

xgb_model = xgb.XGBClassifier(
    n_estimators=300,
    max_depth=5,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=scale_pos_weight,
    eval_metric="logloss",
    random_state=42,
    n_jobs=-1,
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier",   xgb_model),
])

pipeline.fit(X_train, y_train)
print("  ✅  Training complete!")

# ═════════════════════════════════════════════════════════════
# STEP 8 — EVALUATE
# ═════════════════════════════════════════════════════════════

print("\n" + "="*55)
print("STEP 8 — Evaluation on Test Set")
print("="*55)

y_pred = pipeline.predict(X_test)
y_prob = pipeline.predict_proba(X_test)[:, 1]

accuracy  = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, zero_division=0)
recall    = recall_score(y_test, y_pred, zero_division=0)
f1        = f1_score(y_test, y_pred, zero_division=0)
roc_auc   = roc_auc_score(y_test, y_prob)
pr_auc    = average_precision_score(y_test, y_prob)
cm        = confusion_matrix(y_test, y_pred)

print(f"""
  ┌─────────────────────────────────────┐
  │  Accuracy   {accuracy:.4f}                   │
  │  Precision  {precision:.4f}                   │
  │  Recall     {recall:.4f}  ← most important │
  │  F1 Score   {f1:.4f}                   │
  │  ROC-AUC    {roc_auc:.4f}                   │
  │  PR-AUC     {pr_auc:.4f}                   │
  └─────────────────────────────────────┘

  Confusion Matrix:
    TN={cm[0,0]:4d}  FP={cm[0,1]:4d}   (predicted No | predicted Yes)
    FN={cm[1,0]:4d}  TP={cm[1,1]:4d}   (actual Churn)
""")

print(classification_report(y_test, y_pred, target_names=["Retained", "Churned"]))

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_recall = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="recall")
print(f"  5-Fold CV Recall: {cv_recall.mean():.4f} ± {cv_recall.std():.4f}")

# ═════════════════════════════════════════════════════════════
# STEP 9 — FEATURE IMPORTANCE
# ═════════════════════════════════════════════════════════════

print("\n" + "="*55)
print("STEP 9 — Feature Importance")
print("="*55)

importances = pipeline.named_steps["classifier"].feature_importances_
all_names   = NUM_FEATURES + CAT_FEATURES

DISPLAY_NAMES = {
    "Contract":        "Contract Type",
    "MonthlyCharges":  "Monthly Charges",
    "tenure":          "Tenure (months)",
    "InternetService": "Internet Service",
    "PaymentMethod":   "Payment Method",
    "TechSupport":     "Tech Support",
    "OnlineSecurity":  "Online Security",
    "TotalCharges":    "Total Charges",
    "PaperlessBilling":"Paperless Billing",
    "SeniorCitizen":   "Senior Citizen",
    "TenureGroup":     "Tenure Group",
    "ChargesPerMonth": "Charges Per Month",
    "ServiceCount":    "Service Count",
    "MultipleLines":   "Multiple Lines",
    "StreamingTV":     "Streaming TV",
    "StreamingMovies": "Streaming Movies",
    "Gender":          "Gender",
    "Partner":         "Partner",
    "Dependents":      "Dependents",
}

feat_imp = sorted(zip(all_names, importances), key=lambda x: -x[1])

feature_importance_list = []
for feat, imp in feat_imp[:15]:
    display = DISPLAY_NAMES.get(feat, feat)
    print(f"  {display:<28} {imp:.4f}")
    feature_importance_list.append({
        "feature":     feat,
        "displayName": display,
        "importance":  round(float(imp), 4),
        "description": f"XGBoost feature importance: {imp:.4f}",
    })

# ═════════════════════════════════════════════════════════════
# STEP 10 — SAVE ARTIFACTS
# ═════════════════════════════════════════════════════════════

print("\n" + "="*55)
print("STEP 10 — Saving Artifacts")
print("="*55)

# Save model
with open(MODEL_PATH, "wb") as f:
    pickle.dump({"pipeline": pipeline, "num_features": NUM_FEATURES,
                 "cat_features": CAT_FEATURES}, f)
print(f"  ✅  Model → {MODEL_PATH}")

# Save metrics
metrics = {
    "accuracy":  round(float(accuracy),  4),
    "precision": round(float(precision), 4),
    "recall":    round(float(recall),    4),
    "f1Score":   round(float(f1),        4),
    "rocAuc":    round(float(roc_auc),   4),
    "prAuc":     round(float(pr_auc),    4),
    "isDemo":    False,
    "confusionMatrix": {
        "tn": int(cm[0,0]), "fp": int(cm[0,1]),
        "fn": int(cm[1,0]), "tp": int(cm[1,1]),
    },
}
with open(METRICS_PATH, "w") as f:
    json.dump(metrics, f, indent=2)
print(f"  ✅  Metrics → {METRICS_PATH}")

with open(FEATURES_PATH, "w") as f:
    json.dump(feature_importance_list, f, indent=2)
print(f"  ✅  Feature importance → {FEATURES_PATH}")

print("\n" + "="*55)
print("🎉  TRAINING COMPLETE!")
print("="*55)
print("""
  Next steps:
  1. Start FastAPI:
       uvicorn app.main:app --reload --port 8000

  2. Check it loaded the real model (look for ✅ in logs)

  3. Open Swagger docs:
       http://localhost:8000/docs

  4. Connect frontend:
       Add VITE_API_BASE_URL=http://localhost:8000 to frontend/.env.local
""")
