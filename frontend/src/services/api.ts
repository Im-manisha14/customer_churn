// ──────────────────────────────────────────────────────────────
// ChurnIQ — API Service Layer
// Reads VITE_API_BASE_URL. Falls back to mock data when the
// backend is unavailable. Replace mock implementations below
// with real fetch calls once FastAPI is running.
// ──────────────────────────────────────────────────────────────

import type {
  PredictionRequest,
  PredictionResponse,
  ExplanationResponse,
  DashboardStats,
  ChurnByContractItem,
  ChurnByTenureItem,
  RiskDistributionItem,
  ChurnDriver,
  ModelMetrics,
  ConfusionMatrixData,
  RocCurvePoint,
  PrCurvePoint,
  Customer,
  BusinessImpactInput,
  BusinessImpactResult,
  ThresholdComparisonRow,
} from '../types';

import {
  MOCK_CUSTOMERS,
  MOCK_DASHBOARD_STATS,
  MOCK_CHURN_BY_CONTRACT,
  MOCK_CHURN_BY_TENURE,
  MOCK_RISK_DISTRIBUTION,
  MOCK_CHURN_DRIVERS,
  MOCK_MODEL_METRICS,
  MOCK_CONFUSION_MATRIX,
  MOCK_ROC_CURVE,
  MOCK_PR_CURVE,
  generateDemoPrediction,
  generateDemoExplanation,
  generateRetentionRecommendation,
  computeThresholdComparison,
} from './mockData';

// ── Config ────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCK = !API_BASE; // Use mock when no backend URL is set

// Simulated network delay for realistic UX
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Generic fetch wrapper ─────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Health ────────────────────────────────────────────────────

export async function checkHealth(): Promise<{ status: string }> {
  if (USE_MOCK) {
    await delay(300);
    return { status: 'ok' };
  }
  return apiFetch('/health');
}

// ── Dashboard ─────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) { await delay(400); return MOCK_DASHBOARD_STATS; }
  return apiFetch('/dashboard/stats');
}

export async function getChurnByContract(): Promise<ChurnByContractItem[]> {
  if (USE_MOCK) { await delay(300); return MOCK_CHURN_BY_CONTRACT; }
  return apiFetch('/dashboard/churn-by-contract');
}

export async function getChurnByTenure(): Promise<ChurnByTenureItem[]> {
  if (USE_MOCK) { await delay(300); return MOCK_CHURN_BY_TENURE; }
  return apiFetch('/dashboard/churn-by-tenure');
}

export async function getRiskDistribution(): Promise<RiskDistributionItem[]> {
  if (USE_MOCK) { await delay(300); return MOCK_RISK_DISTRIBUTION; }
  return apiFetch('/dashboard/risk-distribution');
}

// ── Prediction ────────────────────────────────────────────────

export async function predictChurn(request: PredictionRequest): Promise<PredictionResponse> {
  if (USE_MOCK) {
    await delay(1200); // Simulate model inference time
    return generateDemoPrediction(
      request.monthlyCharges,
      request.tenure,
      request.contract,
      request.internetService,
      request.paymentMethod,
      request.techSupport,
      request.onlineSecurity,
      request.seniorCitizen,
    );
  }
  return apiFetch('/predict', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function explainPrediction(request: PredictionRequest): Promise<ExplanationResponse> {
  if (USE_MOCK) {
    await delay(800);
    return generateDemoExplanation(
      request.contract,
      request.monthlyCharges,
      request.tenure,
      request.internetService,
      request.paymentMethod,
      request.techSupport,
      request.onlineSecurity,
    );
  }
  return apiFetch('/explain', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export { generateRetentionRecommendation };

// ── Customers ─────────────────────────────────────────────────

export async function getCustomers(): Promise<Customer[]> {
  if (USE_MOCK) { await delay(500); return MOCK_CUSTOMERS; }
  return apiFetch('/customers');
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  if (USE_MOCK) {
    await delay(300);
    return MOCK_CUSTOMERS.find((c) => c.customerID === id) ?? null;
  }
  return apiFetch(`/customers/${id}`);
}

// ── Model Performance ─────────────────────────────────────────

export async function getModelMetrics(): Promise<ModelMetrics> {
  if (USE_MOCK) { await delay(400); return MOCK_MODEL_METRICS; }
  return apiFetch('/model/metrics');
}

export async function getConfusionMatrix(): Promise<ConfusionMatrixData> {
  if (USE_MOCK) { await delay(300); return MOCK_CONFUSION_MATRIX; }
  return apiFetch('/model/confusion-matrix');
}

export async function getRocCurve(): Promise<RocCurvePoint[]> {
  if (USE_MOCK) { await delay(300); return MOCK_ROC_CURVE; }
  return apiFetch('/model/roc-curve');
}

export async function getPrCurve(): Promise<PrCurvePoint[]> {
  if (USE_MOCK) { await delay(300); return MOCK_PR_CURVE; }
  return apiFetch('/model/pr-curve');
}

export async function getChurnDrivers(): Promise<ChurnDriver[]> {
  if (USE_MOCK) { await delay(400); return MOCK_CHURN_DRIVERS; }
  return apiFetch('/model/features');
}

// ── Business Impact ───────────────────────────────────────────

export async function calculateBusinessImpact(
  input: BusinessImpactInput,
): Promise<BusinessImpactResult> {
  if (USE_MOCK) {
    await delay(400);
    const rows = computeThresholdComparison(
      input.customerLifetimeValue,
      input.retentionOfferCost,
      input.expectedRetentionSuccess,
    );
    const row = rows.find((r) => Math.abs(r.threshold - input.targetThreshold) < 0.05) || rows[2];
    return {
      customersTargeted: row.customersTargeted,
      expectedChurnersCaptures: row.expectedChurnersCaptures,
      retentionCost: row.retentionCost,
      potentialValueProtected: row.valueProtected,
      expectedNetBenefit: row.netBenefit,
      roi: row.retentionCost > 0 ? ((row.netBenefit / row.retentionCost) * 100) : 0,
    };
  }
  return apiFetch('/business-impact', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getThresholdComparison(
  input: Omit<BusinessImpactInput, 'targetThreshold'>,
): Promise<ThresholdComparisonRow[]> {
  if (USE_MOCK) {
    await delay(300);
    return computeThresholdComparison(
      input.customerLifetimeValue,
      input.retentionOfferCost,
      input.expectedRetentionSuccess,
    );
  }
  return apiFetch('/business-impact/threshold-comparison', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
