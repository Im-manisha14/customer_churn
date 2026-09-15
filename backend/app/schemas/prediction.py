"""
Pydantic schemas for all ChurnIQ request/response models.
"""

from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field


# ── Customer Input ────────────────────────────────────────────

class CustomerFeatures(BaseModel):
    customerID: str = Field(default="", description="Customer identifier")
    gender: Literal["Male", "Female"]
    seniorCitizen: Literal[0, 1]
    partner: Literal["Yes", "No"]
    dependents: Literal["Yes", "No"]
    tenure: int = Field(ge=0, le=72)
    phoneService: Literal["Yes", "No"]
    multipleLines: Literal["Yes", "No", "No phone service"]
    internetService: Literal["DSL", "Fiber optic", "No"]
    onlineSecurity: Literal["Yes", "No", "No internet service"]
    onlineBackup: Literal["Yes", "No", "No internet service"]
    deviceProtection: Literal["Yes", "No", "No internet service"]
    techSupport: Literal["Yes", "No", "No internet service"]
    streamingTV: Literal["Yes", "No", "No internet service"]
    streamingMovies: Literal["Yes", "No", "No internet service"]
    contract: Literal["Month-to-month", "One year", "Two year"]
    paperlessBilling: Literal["Yes", "No"]
    paymentMethod: Literal[
        "Electronic check",
        "Mailed check",
        "Bank transfer (automatic)",
        "Credit card (automatic)",
    ]
    monthlyCharges: float = Field(ge=0)
    totalCharges: float = Field(ge=0)


# ── Prediction Response ───────────────────────────────────────

class PredictionResponse(BaseModel):
    customerID: str
    churnProbability: float = Field(ge=0.0, le=1.0)
    prediction: Literal[0, 1]
    risk: Literal["Low", "Medium", "High"]
    confidence: Literal["Low", "Medium", "High"]
    isDemo: bool = False


# ── SHAP Explanation ──────────────────────────────────────────

class ShapFactor(BaseModel):
    feature: str
    displayName: str
    value: str | float
    impact: float


class ExplanationResponse(BaseModel):
    customerID: str
    topPositiveFactors: list[ShapFactor]
    topNegativeFactors: list[ShapFactor]
    summary: str
    isDemo: bool = False


# ── Dashboard ─────────────────────────────────────────────────

class DashboardStats(BaseModel):
    totalCustomers: int
    churnRate: float
    highRiskCustomers: int
    revenueAtRisk: float
    isDemo: bool = True


# ── Customer ──────────────────────────────────────────────────

class CustomerRecord(CustomerFeatures):
    churn: Optional[Literal["Yes", "No"]] = None
    churnProbability: Optional[float] = None
    riskLevel: Optional[Literal["Low", "Medium", "High"]] = None


# ── Model Metrics ─────────────────────────────────────────────

class ModelMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1Score: float
    rocAuc: float
    prAuc: float
    isDemo: bool = True


# ── Business Impact ───────────────────────────────────────────

class BusinessImpactInput(BaseModel):
    customerLifetimeValue: float = Field(ge=0, default=300)
    retentionOfferCost: float = Field(ge=0, default=20)
    expectedRetentionSuccess: float = Field(ge=0, le=100, default=30)
    targetThreshold: float = Field(ge=0, le=1, default=0.5)


class BusinessImpactResult(BaseModel):
    customersTargeted: int
    expectedChurnersCaptures: int
    retentionCost: float
    potentialValueProtected: float
    expectedNetBenefit: float
    roi: float


class ThresholdComparisonRow(BaseModel):
    threshold: float
    customersTargeted: int
    expectedChurnersCaptures: int
    retentionCost: float
    valueProtected: float
    netBenefit: float
