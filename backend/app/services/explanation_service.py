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
    """Generate real SHAP-based feature explanations for a customer prediction."""
    from app.services.prediction_service import _pipeline, _build_dataframe, DEMO_MODE, _num_features, _cat_features

    if DEMO_MODE or _pipeline is None:
        return _demo_shap(features)

    try:
        import shap
        df = _build_dataframe(features)
        
        preprocessor = _pipeline.named_steps["preprocessor"]
        model = _pipeline.named_steps["classifier"]
        
        # Transform row through pipeline preprocessor
        X_trans = preprocessor.transform(df)
        
        explainer = shap.TreeExplainer(model)
        shap_vals = explainer.shap_values(X_trans)[0]
        
        all_feature_names = _num_features + _cat_features
        
        positives: list[ShapFactor] = []
        negatives: list[ShapFactor] = []
        
        display_names = {
            "Contract": "Contract Type", "MonthlyCharges": "Monthly Charges",
            "tenure": "Tenure (months)", "InternetService": "Internet Service",
            "PaymentMethod": "Payment Method", "TechSupport": "Tech Support",
            "OnlineSecurity": "Online Security", "TotalCharges": "Total Charges",
            "PaperlessBilling": "Paperless Billing", "SeniorCitizen": "Senior Citizen",
            "TenureGroup": "Tenure Group", "ChargesPerMonth": "Charges Per Month",
            "ServiceCount": "Service Count",
        }
        
        for name, val, shap_v in zip(all_feature_names, df.iloc[0], shap_vals):
            disp = display_names.get(name, name)
            impact = round(float(shap_v), 4)
            if impact > 0:
                positives.append(ShapFactor(feature=name, displayName=disp, value=val, impact=impact))
            elif impact < 0:
                negatives.append(ShapFactor(feature=name, displayName=disp, value=val, impact=impact))
                
        top_pos = sorted(positives, key=lambda f: -f.impact)[:5]
        top_neg = sorted(negatives, key=lambda f: f.impact)[:3]
        
        main = top_pos[0].displayName.lower() if top_pos else "contract type"
        second = top_pos[1].displayName.lower() if len(top_pos) > 1 else "monthly charges"
        summary = (
            f"SHAP feature attribution identifies the customer's {main} and {second} "
            f"as the primary factors driving their predicted churn risk."
        )
        
        return ExplanationResponse(
            customerID=features.customerID,
            topPositiveFactors=top_pos,
            topNegativeFactors=top_neg,
            summary=summary,
            isDemo=False,
        )
    except Exception as e:
        print(f"[WARN] Real SHAP explanation failed: {e} — falling back to demo SHAP")
        return _demo_shap(features)
