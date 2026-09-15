"""Business impact and dashboard routes."""

from fastapi import APIRouter
from app.schemas.prediction import (
    BusinessImpactInput, BusinessImpactResult,
    ThresholdComparisonRow, DashboardStats,
)
from app.services.business_service import compute_impact, compute_comparison

router = APIRouter()

DEMO_DASHBOARD = DashboardStats(
    totalCustomers=7043,
    churnRate=26.54,
    highRiskCustomers=1284,
    revenueAtRisk=184320.0,
    isDemo=True,
)


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    return DEMO_DASHBOARD


@router.get("/dashboard/churn-by-contract")
async def get_churn_by_contract():
    return [
        {"contract": "Month-to-month", "churnRate": 42.7, "retained": 2397, "churned": 1789},
        {"contract": "One year",        "churnRate": 11.3, "retained": 1307, "churned": 166},
        {"contract": "Two year",        "churnRate": 2.8,  "retained": 1647, "churned": 48},
    ]


@router.get("/dashboard/churn-by-tenure")
async def get_churn_by_tenure():
    return [
        {"group": "0–6 months",  "churnRate": 47.2, "retained": 521,  "churned": 464},
        {"group": "6–12 months", "churnRate": 35.8, "retained": 648,  "churned": 361},
        {"group": "1–2 years",   "churnRate": 22.1, "retained": 932,  "churned": 263},
        {"group": "2–4 years",   "churnRate": 11.4, "retained": 1531, "churned": 198},
        {"group": "4+ years",    "churnRate": 6.3,  "retained": 1882, "churned": 127},
    ]


@router.get("/dashboard/risk-distribution")
async def get_risk_distribution():
    return [
        {"risk": "High",   "count": 1284, "percentage": 18.2},
        {"risk": "Medium", "count": 2147, "percentage": 30.5},
        {"risk": "Low",    "count": 3612, "percentage": 51.3},
    ]


@router.post("/business-impact", response_model=BusinessImpactResult)
async def business_impact(inp: BusinessImpactInput):
    return compute_impact(inp)


@router.post("/business-impact/threshold-comparison", response_model=list[ThresholdComparisonRow])
async def threshold_comparison(inp: BusinessImpactInput):
    return compute_comparison(inp.customerLifetimeValue, inp.retentionOfferCost, inp.expectedRetentionSuccess)
