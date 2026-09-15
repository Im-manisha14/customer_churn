"""
Explanation service — generates SHAP-based explanations.

When the real model is loaded, replace the demo logic with:
  import shap
  explainer = shap.TreeExplainer(_model)
  shap_values = explainer.shap_values(input_df)
"""

from __future__ import annotations
from app.schemas.prediction import CustomerFeatures, ExplanationResponse, ShapFactor
from app.services.prediction_service import DEMO_MODE


def _demo_shap(features: CustomerFeatures) -> ExplanationResponse:
    """Rule-based SHAP approximation for demo mode."""
    positives: list[ShapFactor] = []
    negatives: list[ShapFactor] = []

    if features.contract == "Month-to-month":
        positives.append(ShapFactor(feature="Contract", displayName="Contract Type", value="Month-to-month", impact=0.31))
    if features.monthlyCharges > 80:
        positives.append(ShapFactor(feature="MonthlyCharges", displayName="Monthly Charges", value=features.monthlyCharges, impact=0.21))
    if features.tenure < 12:
        positives.append(ShapFactor(feature="tenure", displayName="Tenure (months)", value=features.tenure, impact=0.18))
    if features.internetService == "Fiber optic":
        positives.append(ShapFactor(feature="InternetService", displayName="Internet Service", value="Fiber optic", impact=0.10))
    if features.paymentMethod == "Electronic check":
        positives.append(ShapFactor(feature="PaymentMethod", displayName="Payment Method", value="Electronic check", impact=0.09))
    if features.onlineSecurity == "No":
        positives.append(ShapFactor(feature="OnlineSecurity", displayName="Online Security", value="No", impact=0.07))

    if features.techSupport == "Yes":
        negatives.append(ShapFactor(feature="TechSupport", displayName="Tech Support", value="Yes", impact=-0.08))
    if features.contract == "Two year":
        negatives.append(ShapFactor(feature="Contract", displayName="Contract Type", value="Two year", impact=-0.15))
    if features.tenure > 36:
        negatives.append(ShapFactor(feature="tenure", displayName="Tenure (months)", value=features.tenure, impact=-0.12))
    if features.onlineSecurity == "Yes":
        negatives.append(ShapFactor(feature="OnlineSecurity", displayName="Online Security", value="Yes", impact=-0.06))

    top_pos = sorted(positives, key=lambda f: -f.impact)[:5]
    top_neg = sorted(negatives, key=lambda f: f.impact)[:3]

    main = top_pos[0].displayName.lower() if top_pos else "contract type"
    second = top_pos[1].displayName.lower() if len(top_pos) > 1 else "monthly charges"
    summary = (
        f"The model estimates that the customer's {main} and {second} are "
        f"the strongest contributors to churn risk."
    )

    return ExplanationResponse(
        customerID=features.customerID,
        topPositiveFactors=top_pos,
        topNegativeFactors=top_neg,
        summary=summary,
        isDemo=True,
    )


def explain(features: CustomerFeatures) -> ExplanationResponse:
    """
    Generate SHAP-based explanation for a prediction.

    To connect the real SHAP explainer:
      1. Load TreeExplainer with your trained XGBoost model.
      2. Build the feature DataFrame matching your training pipeline.
      3. Compute shap_values and map to ShapFactor objects.
      4. Replace the _demo_shap() call below.
    """
    if DEMO_MODE:
        return _demo_shap(features)

    # ── Real SHAP path ───────────────────────────────────────
    # import shap
    # from app.services.prediction_service import _model
    # import pandas as pd
    #
    # row = pd.DataFrame([features.model_dump()])
    # explainer = shap.TreeExplainer(_model)
    # sv = explainer.shap_values(row)[0]
    # ... map sv to ShapFactor list ...

    return _demo_shap(features)  # placeholder
