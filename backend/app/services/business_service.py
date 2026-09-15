"""Business impact calculation service."""

from __future__ import annotations
import math
from app.schemas.prediction import (
    BusinessImpactInput, BusinessImpactResult, ThresholdComparisonRow,
)

TOTAL_CUSTOMERS = 7043
ACTUAL_CHURNERS = 1868


def compute_impact(inp: BusinessImpactInput) -> BusinessImpactResult:
    pct_targeted = max(0.05, 0.72 - inp.targetThreshold * 0.8)
    targeted = math.ceil(TOTAL_CUSTOMERS * pct_targeted)
    recall = max(0.10, 0.96 - inp.targetThreshold * 0.95)
    captured = math.ceil(ACTUAL_CHURNERS * recall)
    cost = targeted * inp.retentionOfferCost
    retained = math.ceil(captured * (inp.expectedRetentionSuccess / 100))
    value_protected = retained * inp.customerLifetimeValue
    net = value_protected - cost
    roi = (net / cost * 100) if cost > 0 else 0.0

    return BusinessImpactResult(
        customersTargeted=targeted,
        expectedChurnersCaptures=captured,
        retentionCost=cost,
        potentialValueProtected=value_protected,
        expectedNetBenefit=net,
        roi=roi,
    )


def compute_comparison(
    lifetime_value: float,
    retention_cost: float,
    success_rate: float,
) -> list[ThresholdComparisonRow]:
    thresholds = [0.30, 0.40, 0.50, 0.60, 0.70, 0.80]
    rows = []
    for t in thresholds:
        pct_targeted = max(0.05, 0.72 - t * 0.8)
        targeted = math.ceil(TOTAL_CUSTOMERS * pct_targeted)
        recall = max(0.10, 0.96 - t * 0.95)
        captured = math.ceil(ACTUAL_CHURNERS * recall)
        cost = targeted * retention_cost
        retained = math.ceil(captured * (success_rate / 100))
        value_protected = retained * lifetime_value
        net = value_protected - cost
        rows.append(ThresholdComparisonRow(
            threshold=t,
            customersTargeted=targeted,
            expectedChurnersCaptures=captured,
            retentionCost=cost,
            valueProtected=value_protected,
            netBenefit=net,
        ))
    return rows
