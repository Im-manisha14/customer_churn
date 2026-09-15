"""Prediction and explanation routes."""

from fastapi import APIRouter
from app.schemas.prediction import CustomerFeatures, PredictionResponse, ExplanationResponse
from app.services import prediction_service, explanation_service

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict_churn(features: CustomerFeatures):
    """Predict churn probability for a single customer."""
    return prediction_service.predict(features)


@router.post("/explain", response_model=ExplanationResponse)
async def explain_prediction(features: CustomerFeatures):
    """Return SHAP-based explanation for a customer's churn risk."""
    return explanation_service.explain(features)
