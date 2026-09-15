// ──────────────────────────────────────────────────────────────
// ChurnIQ — Shared TypeScript Types
// ──────────────────────────────────────────────────────────────

export type RiskLevel = 'Low' | 'Medium' | 'High';

// ── Customer ──────────────────────────────────────────────────

export interface Customer {
  customerID: string;
  gender: 'Male' | 'Female';
  seniorCitizen: 0 | 1;
  partner: 'Yes' | 'No';
  dependents: 'Yes' | 'No';
  tenure: number; // months
  phoneService: 'Yes' | 'No';
  multipleLines: 'Yes' | 'No' | 'No phone service';
  internetService: 'DSL' | 'Fiber optic' | 'No';
  onlineSecurity: 'Yes' | 'No' | 'No internet service';
  onlineBackup: 'Yes' | 'No' | 'No internet service';
  deviceProtection: 'Yes' | 'No' | 'No internet service';
  techSupport: 'Yes' | 'No' | 'No internet service';
  streamingTV: 'Yes' | 'No' | 'No internet service';
  streamingMovies: 'Yes' | 'No' | 'No internet service';
  contract: 'Month-to-month' | 'One year' | 'Two year';
  paperlessBilling: 'Yes' | 'No';
  paymentMethod:
    | 'Electronic check'
    | 'Mailed check'
    | 'Bank transfer (automatic)'
    | 'Credit card (automatic)';
  monthlyCharges: number;
  totalCharges: number;
  churn?: 'Yes' | 'No';
  // Enriched fields (added by prediction service)
  churnProbability?: number;
  riskLevel?: RiskLevel;
}

// ── Prediction ────────────────────────────────────────────────

export interface PredictionRequest {
  customerID: string;
  gender: string;
  seniorCitizen: 0 | 1;
  partner: string;
  dependents: string;
  tenure: number;
  phoneService: string;
  multipleLines: string;
  internetService: string;
  onlineSecurity: string;
  onlineBackup: string;
  deviceProtection: string;
  techSupport: string;
  streamingTV: string;
  streamingMovies: string;
  contract: string;
  paperlessBilling: string;
  paymentMethod: string;
  monthlyCharges: number;
  totalCharges: number;
}

export interface PredictionResponse {
  customerID: string;
  churnProbability: number;
  prediction: 0 | 1;
  risk: RiskLevel;
  confidence: 'Low' | 'Medium' | 'High';
  isDemo: boolean;
}

// ── Explanation (SHAP) ────────────────────────────────────────

export interface ShapFactor {
  feature: string;
  value: string | number;
  impact: number; // positive = increases churn, negative = decreases
  displayName: string;
}

export interface ExplanationResponse {
  customerID: string;
  topPositiveFactors: ShapFactor[];
  topNegativeFactors: ShapFactor[];
  summary: string;
  isDemo: boolean;
}

// ── Retention Recommendation ──────────────────────────────────

export interface RetentionAction {
  id: number;
  action: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface RetentionRecommendation {
  priority: 'High' | 'Medium' | 'Low';
  actions: RetentionAction[];
  isRuleBased: boolean; // always true until real model is connected
}

// ── Dashboard ─────────────────────────────────────────────────

export interface DashboardStats {
  totalCustomers: number;
  churnRate: number;
  highRiskCustomers: number;
  revenueAtRisk: number;
  isDemo: boolean;
}

export interface ChurnByContractItem {
  contract: string;
  churnRate: number;
  retained: number;
  churned: number;
}

export interface ChurnByTenureItem {
  group: string;
  churnRate: number;
  retained: number;
  churned: number;
}

export interface RiskDistributionItem {
  risk: RiskLevel;
  count: number;
  percentage: number;
}

export interface MonthlyChargesItem {
  monthlyCharges: number;
  churned: boolean;
  customerID: string;
}

// ── Model Performance ─────────────────────────────────────────

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  isDemo: boolean;
}

export interface ConfusionMatrixData {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

export interface RocCurvePoint {
  fpr: number;
  tpr: number;
}

export interface PrCurvePoint {
  recall: number;
  precision: number;
}

export interface ThresholdMetrics {
  threshold: number;
  precision: number;
  recall: number;
  falsePositives: number;
  falseNegatives: number;
  f1: number;
}

// ── Churn Drivers ─────────────────────────────────────────────

export interface ChurnDriver {
  feature: string;
  displayName: string;
  importance: number;
  description: string;
}

// ── Business Impact ───────────────────────────────────────────

export interface BusinessImpactInput {
  customerLifetimeValue: number;
  retentionOfferCost: number;
  expectedRetentionSuccess: number; // 0–100 %
  targetThreshold: number; // 0–1
}

export interface BusinessImpactResult {
  customersTargeted: number;
  expectedChurnersCaptures: number;
  retentionCost: number;
  potentialValueProtected: number;
  expectedNetBenefit: number;
  roi: number;
}

export interface ThresholdComparisonRow {
  threshold: number;
  customersTargeted: number;
  expectedChurnersCaptures: number;
  retentionCost: number;
  valueProtected: number;
  netBenefit: number;
}

// ── API Service ───────────────────────────────────────────────

export interface ApiError {
  message: string;
  status?: number;
}
